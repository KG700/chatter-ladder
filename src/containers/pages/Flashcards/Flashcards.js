import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";

import Flashcard from "../../../components/Flashcard/Flashcard";
import FlashcardSummary from "../../../components/Flashcard/Summary/FlashcardSummary";

const MINIMUM_FLASHCARDS = 5;
const MAXIMUM_FLASHCARDS = 30;

class Flashcards extends Component {
  state = {
    numFlashcards: MINIMUM_FLASHCARDS,
    countVocabList: 0,
    flashcardsVocab: [],
    showFlashcards: false,
    showFlashcardNumber: 0,
    progress: {
      numCorrect: 0,
      numIncorrect: 0,
      numRemaining: 0,
    },
    flipped: false,
    transition: true,
    showSummary: false,
  };

  componentDidMount() {
    axios
      .get("/vocabulary/count", {
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`,
        },
      })
      .then((response) => {
        this.setState({ countVocabList: response.data });
      })
      .catch((error) => console.log(error));
  }

  increaseFlashcardsHandler = () => {
    if (
      this.state.numFlashcards <
      Math.min(MAXIMUM_FLASHCARDS, this.state.countVocabList)
    ) {
      this.setState((prevState) => {
        return { numFlashcards: prevState.numFlashcards + 1 };
      });
    }
  };

  decreaseFlashcardsHandler = () => {
    if (this.state.numFlashcards > MINIMUM_FLASHCARDS) {
      this.setState((prevState) => {
        return { numFlashcards: prevState.numFlashcards - 1 };
      });
    }
  };

  startFlashcardsHandler = () => {
    const flashcardRequirements = {
      number: this.state.numFlashcards,
    };

    axios
      .post("/flashcards", flashcardRequirements, {
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`,
        },
      })
      .then((response) => {
        let vocabData = [];
        response.data.map((vocab) => {
          let updatedVocab = {
            ...vocab,
            seen: false,
            correct: false,
            incorrect: false,
          };
          return vocabData.push(updatedVocab);
        });
        const updatedProgress = this.updateProgress(vocabData);
        this.setState({
          flashcardsVocab: vocabData,
          showFlashcards: true,
          progress: updatedProgress,
        });
      })
      .catch((error) => console.log(error));
  };
  updateProgress = (vocabList) => {
    let updatedProgress = {
      numCorrect: 0,
      numIncorrect: 0,
      numRemaining: this.state.numFlashcards,
    };
    vocabList.map((vocab) => {
      if (vocab.seen) {
        updatedProgress.numRemaining--;
      }
      if (vocab.correct) {
        updatedProgress.numCorrect++;
      }
      if (vocab.incorrect) {
        updatedProgress.numIncorrect++;
      }
      return "done";
    });
    return updatedProgress;
  };

  correctHandler = () => {
    const updatedVocabList = this.state.flashcardsVocab.map((vocab, index) => {
      if (index === this.state.showFlashcardNumber) {
        return {
          ...vocab,
          seen: true,
          correct: true,
          incorrect: false,
        };
      }
      return vocab;
    });
    const updatedProgress = this.updateProgress(updatedVocabList);
    this.setState({
      flashcardsVocab: updatedVocabList,
      progress: updatedProgress,
    });
  };

  incorrectHandler = () => {
    const updatedVocabList = this.state.flashcardsVocab.map((vocab, index) => {
      if (index === this.state.showFlashcardNumber) {
        return {
          ...vocab,
          seen: true,
          correct: false,
          incorrect: true,
        };
      }
      return vocab;
    });
    const updatedProgress = this.updateProgress(updatedVocabList);
    this.setState({
      flashcardsVocab: updatedVocabList,
      progress: updatedProgress,
    });
  };

  nextFlashcardHandler = () => {
    this.setState((prevState) => {
      return {
        showFlashcardNumber: prevState.showFlashcardNumber + 1,
        flipped: false,
        transition: false,
      };
    });
  };

  previousFlashcardHandler = () => {
    this.setState((prevState) => {
      return {
        showFlashcardNumber: prevState.showFlashcardNumber - 1,
        flipped: false,
        transition: false,
      };
    });
  };

  flipHandler = () => {
    this.setState((prevState) => ({
      flipped: !prevState.flipped,
      transition: true,
    }));
  };

  flashcardFinishHandler = () => {
    axios
      .post("/flashcards/completed", this.state.flashcardsVocab, {
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`,
        },
      })
      .then((response) => {
        console.log(response.data);
        this.setState({ showSummary: true, showFlashcards: false });
      })
      .catch((error) => console.log(error));
  };

  startAgainHandler = () => {
    this.setState({
      showSummary: false,
      showFlashcards: false,
      showFlashcardNumber: 0,
    });
  };

  render() {
    const nextDisabled =
      this.state.numFlashcards === this.state.showFlashcardNumber + 1;
    const previousDisabled = this.state.showFlashcardNumber === 0;

    return (
      <>
        <h1>Flashcards page</h1>
        {this.state.countVocabList >= 5 &&
        !this.state.showFlashcards &&
        !this.state.showSummary ? (
          <>
            <div>{this.state.numFlashcards}</div>
            <button onClick={this.decreaseFlashcardsHandler}>-</button>
            <button onClick={this.increaseFlashcardsHandler}>+</button>
            <button onClick={this.startFlashcardsHandler}>start</button>
          </>
        ) : this.state.showFlashcards ? (
          <>
            <p>
              {this.state.progress.numCorrect} correct,{" "}
              {this.state.progress.numIncorrect} incorrect.{" "}
              {this.state.progress.numRemaining} Flashcards to go
            </p>
            <Flashcard
              front={
                this.state.flashcardsVocab[this.state.showFlashcardNumber].word
              }
              back={
                this.state.flashcardsVocab[this.state.showFlashcardNumber]
                  .translation
              }
              flipped={this.state.flipped}
              clicked={this.flipHandler}
              transition={this.state.transition}
            />
            <button onClick={this.correctHandler}>Correct</button>
            <button onClick={this.incorrectHandler}>Incorrect</button>
            <button
              onClick={this.previousFlashcardHandler}
              disabled={previousDisabled}
            >
              Previous
            </button>
            <button
              onClick={this.nextFlashcardHandler}
              disabled={
                nextDisabled ||
                !this.state.flashcardsVocab[this.state.showFlashcardNumber].seen
              }
            >
              Next
            </button>
            <button onClick={this.flashcardFinishHandler}>Finish</button>
          </>
        ) : this.state.showSummary ? (
          <>
            <FlashcardSummary summary={this.state.flashcardsVocab} />
            <button onClick={this.startAgainHandler}>Start Again</button>
          </>
        ) : (
          <p>
            You need to have at least 5 words in your vocab list. Please add
            more words on the Vocabulary page
          </p>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accessToken: state.token,
  };
};

export default connect(mapStateToProps)(Flashcards);
