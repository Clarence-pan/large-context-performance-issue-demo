import React, {
  memo,
  useState,
  useRef,
  useContext,
  createContext
} from "react";

const NewsContext = createContext({
  car: "",
  phone: ""
});

const Alice = memo(() => {
  const { car } = useContext(NewsContext);
  const renderTimes = useRef(0);

  renderTimes.current++;

  return (
    <div>
      Alice: got car news: {car} (renderTimes: {renderTimes.current})
    </div>
  );
});

const Bob = memo(() => {
  const { phone } = useContext(NewsContext);
  const renderTimes = useRef(0);

  renderTimes.current++;

  return (
    <div>
      Bob: got phone news: {phone} (renderTimes: {renderTimes.current})
    </div>
  );
});

export default function App() {
  const renderTimes = useRef(0);
  renderTimes.current++;

  const [foo, setFoo] = useState("");
  const [news, setNews] = useState({
    car: "",
    phone: ""
  });

  return (
    <div className="App">
      <NewsContext.Provider value={news}>
        <Alice />
        <Bob />
      </NewsContext.Provider>

      <button
        onClick={() =>
          setNews(old => ({
            ...old,
            car: "car news @" + getTime()
          }))
        }
      >
        update car news
      </button>
      <button
        onClick={() =>
          setNews(old => ({
            ...old,
            phone: "phone news @" + getTime()
          }))
        }
      >
        update phone news
      </button>

      <div>
        Foo: {foo}
        (renderTimes: {renderTimes.current})
      </div>

      <button onClick={() => setFoo("foo updated @" + getTime())}>
        update foo (should not trigger Alice and Bob rerender)
      </button>
    </div>
  );
}

function getTime() {
  const d = new Date();
  return d.toTimeString().replace(/ .*$/, "") + "." + d.getMilliseconds();
}
