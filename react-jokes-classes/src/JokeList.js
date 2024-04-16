// JokeList.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

/** List of jokes. */

const JokeList = ({ numJokesToGet = 5 }) => {
  const [jokes, setJokes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getJokes();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const getJokes = useCallback(async () => {
    try {
      // load jokes one at a time, adding not-yet-seen jokes
      let jokesArray = [];
      let seenJokes = new Set();

      while (jokesArray.length < numJokesToGet) {
        let res = await axios.get("https://icanhazdadjoke.com", {
          headers: { Accept: "application/json" }
        });
        let { ...joke } = res.data;

        if (!seenJokes.has(joke.id)) {
          seenJokes.add(joke.id);
          jokesArray.push({ ...joke, votes: 0 });
        } else {
          console.log("duplicate found!");
        }
      }

      setJokes(jokesArray);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
    }
  }, [numJokesToGet]); // Dependency array ensures this effect runs when numJokesToGet changes

  const generateNewJokes = () => {
    setIsLoading(true);
    getJokes();
  };

  const vote = (id, delta) => {
    setJokes(jokes =>
      jokes.map(j =>
        j.id === id ? { ...j, votes: j.votes + delta } : j
      )
    );
  };

  let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

  return (
    <div className="JokeList">
      <button className="JokeList-getmore" onClick={generateNewJokes}>
        Get New Jokes
      </button>

      {isLoading ? (
        <div className="loading">
          <i className="fas fa-4x fa-spinner fa-spin" />
        </div>
      ) : (
        sortedJokes.map(j => (
          <Joke
            text={j.joke}
            key={j.id}
            id={j.id}
            votes={j.votes}
            vote={vote}
          />
        ))
      )}
    </div>
  );
};

export default JokeList;
