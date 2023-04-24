import React from 'react';
import './App.css';
import selfPortrait from './assets/self-portrait-small.jpeg';

function App() {
  return (
    <div className="App">
      <header>
        <img className="self-portrait" src={selfPortrait} alt="self portrait" />
        <div className="blurb">
          <div>Lucy Mair</div>
          <div className="spacer"></div>
          <div>Software Developer</div>
          <div className="spacer"></div>
          <div>Manchester, UK</div>
        </div>
      </header>
      <div className="content-wrapper">
        <div className="content">
          <p>
            Hello, my name is Lucy Mair. I am a front end software developer
            based in London.
          </p>
          <p>This website will, eventually, become a portfolio of my work.</p>
          <p>Until then, umm, hi?</p>
        </div>
      </div>
    </div>
  );
}

export default App;
