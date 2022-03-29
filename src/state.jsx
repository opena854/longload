import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import JSONata from 'jsonata'
import get from "just-safe-get"
import set from "just-safe-set"
import clone from "just-clone"

const State = createContext({})

export const AppState = ({initialState, children}) => {
  const [state, dispatch] = useReducer(reducer, initialState || {})

  return <State.Provider value={{state, dispatch}} children={children} />
}

export const useAppStateDispatch = () => useContext(State).dispatch

export const useAppState = path => {
  const {state, dispatch} = useContext(State)
  const set = useCallback( payload => dispatch({ type: "set", path, payload }), [path, dispatch])
  return path ?  [get(state, path), set] : []
}

export const useAppStateQuery = query => useMemo( () => JSONata(query), [query]).evaluate(useContext(State).state, )

export const useAppStateTransformer = () => {
  const [exec, setExec] = useState(undefined)
  const context = useContext(State)

  useEffect ( () => {
    if (exec) {
      const query = `$ ~> | ${exec.location} | ${exec.updatedelete} |`
      const bindings = exec.bindings;
      const dispatch = context.dispatch;

      setExec(undefined);
      JSONata(query).evaluate(context.state, bindings, ( err, payload ) => {
        if (!err) dispatch({type: "init", payload: payload})
        else console.error("error handling app state transformation", err);
      })
    }
  }, [exec, context])

  return useCallback( (location, updatedelete, bindings) => setExec({ location, updatedelete, bindings }), [])
}

const REDUCER_ACTIONS = {
  set: ({path, payload}, state) => ( obj => { set(obj, path || "", payload); return obj})(clone(state)),
  init: ({payload}) => payload,
  nd: ({type}) => console.error(`dispatch action (${type}) not defined for app state`)
}

const reducer = (state, action) => REDUCER_ACTIONS[action.type || "nd"](action, state)





