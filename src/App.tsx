import {
  createContext,
  Dispatch,
  FC,
  memo,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ContextType = {
  fontSize: number;
  setFontSize: (number: () => number) => number;
};

const Context = createContext<ContextType | null>(null);

const useMyContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useMyContext must be used within a ContextProvider");
  }

  return context;
};

const ContextProvider = ({ children }: { children: ReactNode }) => {
  console.log("ContextProvider render");

  const [fontSize, setFontSize] = useState(16);

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCounter((prev) => prev + 1);
    }, 1000);
  }, []);

  const memoValue = useMemo(
    () => ({ fontSize, setFontSize }),
    [fontSize, setFontSize],
  );

  return (
    <Context.Provider value={memoValue}>
      <div>Counter: {counter}</div>
      {children}
    </Context.Provider>
  );
};

function App() {
  console.log("App render");

  return (
    <ContextProvider>
      <Component1 />
    </ContextProvider>
  );
}

const Component1 = () => {
  console.log("Component1 render");

  return (
    <div>
      <Component2 />
      <Component3Memo />
      <Component4 />
    </div>
  );
};

const Component2 = () => {
  console.log("Component2 render");

  const { fontSize } = useMyContext();

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        border: "1px solid black",
        padding: "10px",
      }}
    >
      Current font size: {fontSize}px
    </div>
  );
};

const Component3 = ({ setFontSize }: Pick<ContextType, "setFontSize">) => {
  console.log("Component3 render");

  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        margin: "10px 0",
      }}
    >
      <button onClick={() => setFontSize((fontSize) => fontSize + 1)}>
        Increase font size
      </button>
    </div>
  );
};

const withSetterFromContext = <T extends Record<string, any>>(
  Component: FC<any>,
  Context: React.Context<T | null>,
  setNames: Array<keyof T>,
) => {
  const ComponentMemo = memo(Component);

  return (props: any) => {
    const contextValue = useContext(Context);
    if (!contextValue) {
      throw new Error(
        "Context value is null. Ensure the provider is properly set.",
      );
    }

    const setters = setNames.reduce(
      (acc, name) => {
        if (typeof contextValue[name] === "function") {
          acc[name as string] = contextValue[name];
        }
        return acc;
      },
      {} as Record<string, any>,
    );

    return <ComponentMemo {...props} {...setters} />;
  };
};

const Component3Memo = withSetterFromContext<ContextType>(Component3, Context, [
  "setFontSize",
]);

const Component4 = () => {
  console.log("Component4 render");

  return (
    <div>
      <Component5 />
    </div>
  );
};

const Component5 = () => {
  console.log("Component5 render");

  return <div>Hi, I'm Component5</div>;
};

export default App;
