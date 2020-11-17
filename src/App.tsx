import React from 'react';
import './App.css';
import wip from './assets/work-in-progress.jpeg';

function App() {
  return (
    <div className="App">
      <div>Hello Lucy</div>
      <img className="wip" src={wip} />
    </div>
  );
}

export default App;
