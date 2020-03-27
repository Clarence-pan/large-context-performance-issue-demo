import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback
} from "react";
import shallowEqual from "shallowequal";

const contextDataMap = new WeakMap(); // context => ContextData

export function createSelectableContext(defaultValue) {
  const InstanceIdContext = createContext();

  const contextInstances = new WeakMap(); // instaceId => {value, listeners, onChange, emitChangeEvent}
  const contextData = {
    defaultValue,
    InstanceIdContext,
    instances: contextInstances
  };

  const getOrCreateInstance = (instanceId, value) => {
    let contextInst = contextInstances.get(instanceId);
    if (!contextInst) {
      contextInst = {
        value,
        ...createChangeEventEmitter()
      };
      contextInstances.set(instanceId, contextInst);
    }

    return contextInst;
  };

  const context = {
    _id: randomId(),
    Provider: ({ value, children }) => {
      const instanceId = useComponentId();

      const contextInst = getOrCreateInstance(instanceId, value);

      useEffect(() => {
        contextInst.value = value;
        contextInst.emitChangeEvent(value);
      }, [contextInst, value]);

      return (
        <InstanceIdContext.Provider value={instanceId}>
          {children}
        </InstanceIdContext.Provider>
      );
    },
    Consumer: ({ children }) => {
      if (typeof children !== "function") {
        return null; // TODO: throw error?
      }

      return (
        <InstanceIdContext.Consumer>
          {instId =>
            (ctxInst => children(ctxInst ? ctxInst.value : defaultValue))(
              contextInstances.get(instId)
            )
          }
        </InstanceIdContext.Consumer>
      );
    }
  };

  contextDataMap.set(context, contextData);

  return context;
}

export function useSelectableContext(context, selector, deps) {
  const contextData = contextDataMap.get(context);
  const instanceId = useContext(contextData.InstanceIdContext);
  const instance = contextData.instances.get(instanceId);

  const [selectedValue, setSeletedValue] = useState(selector(instance.value));

  const updateValues = useCallback(() => {
    setSeletedValue(oldValue => {
      const newValue = selector(instance.value);
      return shallowEqual(newValue, oldValue) ? oldValue : newValue;
    });

    // eslint-disable-next-line
  }, [instance, ...deps]);

  useEffect(() => {
    updateValues();
  }, [updateValues]);

  useEffect(() => instance.onChange(updateValues), [instance, updateValues]);

  return selectedValue;
}

function randomId() {
  return Math.random()
    .toString(30)
    .slice(2);
}

function createChangeEventEmitter() {
  const listeners = [];
  return {
    onChange: cb => {
      listeners.push(cb);

      return () => {
        const i = listeners.indexOf(cb);
        if (i >= 0) {
          listeners.splice(i, 1);
        }
      };
    },
    emitChangeEvent: value => {
      listeners.forEach(cb => {
        cb(value);
      });
    }
  };
}

function useComponentId() {
  const [instanceId] = useState(() => ({
    _id: randomId()
  }));
  return instanceId;
}
