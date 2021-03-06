import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";

import Table from "../../../components/UI/Table/Table";
import Input from "../../../components/UI/Input/Input";
import "./Vocabulary.css";

class Vocabulary extends Component {
  state = {
    users: [],
    vocab: [],
    vocabForm: {
      word: {
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "New word",
        },
        value: "",
        validation: {
          valid: false,
          required: true,
          unique: true,
          minLength: 1,
          maxLength: 20,
        },
        touched: false,
      },
      translation: {
        elementType: "input",
        elementConfig: {
          type: "text",
          placeholder: "Translation",
        },
        value: "",
        validation: {
          valid: false,
          required: true,
          minLength: 1,
          maxLength: 40,
        },
        touched: false,
      },
    },
    formIsValid: false,
  };

  componentDidMount() {
    console.log("Component mounted");
    axios
      .get("/vocabulary", {
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`,
        },
      })
      .then((response) => {
        this.setState({ vocab: response.data });
      })
      .catch((error) => console.log(error));
  }

  checkValidity(value, rules) {
    let isValid = true;

    if (!rules) {
      return true;
    }

    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }

    if (rules.minLength) {
      isValid = value.length >= rules.minLength && isValid;
    }

    if (rules.maxLength) {
      isValid = value.length <= rules.maxLength && isValid;
    }

    return isValid;
  }

  addVocabHandler = (event) => {
    event.preventDefault();

    // need to check if word is unique in users vocab list before submitting

    const vocabData = {
      word: this.state.vocabForm.word.value,
      word_language: "spanish",
      translation: this.state.vocabForm.translation.value,
      translation_language: "english",
    };

    axios
      .post("/vocabulary", vocabData, {
        headers: {
          Authorization: `Bearer ${this.props.accessToken}`,
        },
      })
      .then((response) => {
        let updatedForm = {
          ...this.state.vocabForm,
        };
        let updatedFormWord = {
          ...updatedForm.word,
          value: "",
        };
        let updatedFormTranslation = {
          ...updatedForm.translation,
          value: "",
        };
        updatedForm.word = updatedFormWord;
        updatedForm.translation = updatedFormTranslation;
        this.setState({ vocabForm: updatedForm });
      })
      .catch((error) => console.log(error));
  };

  inputChangedHandler = (event, inputIdentifier) => {
    // console.log(event.target.value);
    const updatedVocabForm = {
      ...this.state.vocabForm,
    };

    const updatedFormElement = {
      ...updatedVocabForm[inputIdentifier],
    };

    const updatedFormValidity = {
      ...updatedFormElement["validation"],
    };

    updatedFormElement.value = event.target.value;
    updatedFormElement.touched = true;
    updatedFormValidity.valid = this.checkValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );

    updatedFormElement["validation"] = updatedFormValidity;
    updatedVocabForm[inputIdentifier] = updatedFormElement;

    let formIsValid = true;
    for (let inputIdentifier in updatedVocabForm) {
      formIsValid =
        updatedVocabForm[inputIdentifier]["validation"].valid && formIsValid;
    }

    this.setState({ vocabForm: updatedVocabForm, formIsValid: formIsValid });
  };

  render() {
    const headings = [
      "Spanish Word",
      "Translation",
      "Groups",
      "Learning Status",
    ];

    const rows = this.state.vocab.map((row) => {
      return [row.word, row.translation, "", row.progress];
    });
    // const rows = [
    //   [
    //     'hola',
    //     'hello',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'hacinda',
    //     'villa',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'amigo',
    //     'friend',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'salud',
    //     'Bless you (after someone sneezes',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'Buenas noches',
    //     'Good evening',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'Permiso, con permiso (para pasar)',
    //     'Excuse me please (used to pass someone)',
    //     '',
    //     'new'
    //   ],
    //   [
    //     'el dolor de cabeza',
    //     'headache',
    //     '',
    //     'new'
    //   ]
    // ]

    return (
      <>
        <h1>Vocabulary List</h1>
        <form onSubmit={this.addVocabHandler}>
          <Input
            type="text"
            name="word"
            placeholder={"Enter new word"}
            value={this.state.vocabForm.word.value}
            onChange={(event) => this.inputChangedHandler(event, "word")}
            invalid={
              !this.state.vocabForm.word.validation.valid &&
              this.state.vocabForm.word.touched
            }
          />
          <Input
            type="text"
            name="translation"
            placeholder={"Enter translation"}
            value={this.state.vocabForm.translation.value}
            onChange={(event) => this.inputChangedHandler(event, "translation")}
            invalid={
              !this.state.vocabForm.translation.validation.valid &&
              this.state.vocabForm.translation.touched
            }
          />
          <button disabled={!this.state.formIsValid}>Submit</button>
        </form>

        <Table headings={headings} rows={rows} />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accessToken: state.token,
  };
};

export default connect(mapStateToProps)(Vocabulary);
