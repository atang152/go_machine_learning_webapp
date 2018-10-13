package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/atang152/go_machine_learning_webapp/config"
	// "io"
	// "io/ioutil"
	"net/http"
	// "strings"
)

type Data struct {
	Accuracy float32 `json:"accuracy"`
}

type Prediction struct {
	Name        string  `json:"name"`
	Probability float32 `json:"value"`
}

func main() {

	// Add route to serve css files
	http.Handle("/favicon.ico", http.NotFoundHandler())
	http.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("./static"))))

	// Handle routing
	http.HandleFunc("/", index)
	http.HandleFunc("/train", train)
	http.HandleFunc("/predict", predict)

	fmt.Println("Starting server...")
	http.ListenAndServe(":8080", nil)

}

func getJson(url string, target interface{}) error {
	r, err := http.Get(url)
	if err != nil {
		return err
	}

	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(target)
}

func postJson(url string, jsonValue []uint8) *http.Response {
	r, err := http.Post(url, "application/json", bytes.NewBuffer(jsonValue))

	if err != nil {
		fmt.Printf("HTTP request failed with error %s\n", err)
		panic(err)
	}
	return r

}

func index(w http.ResponseWriter, r *http.Request) {

	config.TPL.ExecuteTemplate(w, "index.html", nil)
}

func train(w http.ResponseWriter, r *http.Request) {

	d1 := Data{}
	if r.Method == "POST" {
		//Form submitted
		v := r.FormValue("C_Parameter")
		jsonData := map[string]string{"C_Parameter": v}
		jsonValue, _ := json.Marshal(jsonData)

		res := postJson("http://localhost:8081/api/train", jsonValue)
		json.NewDecoder(res.Body).Decode(&d1)
		fmt.Println(d1.Accuracy)

	} else {
		http.Error(w, http.StatusText(405), http.StatusMethodNotAllowed)
	}

	config.TPL.ExecuteTemplate(w, "index.html", d1.Accuracy)
}

func predict(w http.ResponseWriter, r *http.Request) {

	prob := []Prediction{}
	if r.Method == "POST" {

		//Form submitted
		r.ParseForm()
		jsonData := make(map[string]string)

		for name, _ := range r.Form {
			jsonData[name] = r.Form.Get(name)
		}

		jsonValue, _ := json.Marshal(jsonData)
		res := postJson("http://localhost:8081/api/predict", jsonValue)
		json.NewDecoder(res.Body).Decode(&prob)

		fmt.Println(prob)
	} else {

		http.Error(w, http.StatusText(405), http.StatusMethodNotAllowed)
	}

	config.TPL.ExecuteTemplate(w, "index.html", prob)
}

// AJAX
/*	d1 := Data{}
	if r.Method == "POST" {
		v, err := ioutil.ReadAll(r.Body)

		if err != nil {
			fmt.Printf("Error reading response body %s\n", err)
			panic(err)
		}

		jsonData := map[string]string{"C_Parameter": string(v)}
		jsonValue, _ := json.Marshal(jsonData)

		res := postJson("http://localhost:8081/api/train", jsonValue)
		json.NewDecoder(res.Body).Decode(&d1)
		fmt.Println(d1.Accuracy)
	} else {
		http.Error(w, http.StatusText(405), http.StatusMethodNotAllowed)
	}

	fmt.Fprintln(w, d1.Accuracy)*/

//  FRONTEND with Angular: https://auth0.com/blog/developing-golang-and-angular-apps-part-2-angular-front-end/
// https://www.packtpub.com/mapt/book/web_development/9781788394185/3/ch03lvl1sec27/gopherjs-examples

// https://docs.emmet.io/cheat-sheet/
// https://github.com/Jcharis/Machine-Learning-Web-Apps/tree/master/Iris-Species-Predictor-ML-Flask-App-With-Materialize.css
// https://github.com/delsner/flask-angular-data-science/tree/master/frontend
// https://stackoverflow.com/questions/43264727/call-python-tasks-from-golang
// https://www.thepolyglotdeveloper.com/2017/07/consume-restful-api-endpoints-golang-application/
// https://stackoverflow.com/questions/17156371/how-to-get-json-response-in-golang
// https://blog.alexellis.io/golang-json-api-client/

// d1 := Data{}
// err := getJson("http://localhost:8081/api/train", &d1)
// if err != nil {
// 	fmt.Println(err)
// }

// fmt.Println(d1.Accuracy)

// https://www.willmaster.com/library/manage-forms/form-disappears-immediately-when-button-is-clicked.php
// https://stackoverflow.com/questions/34839811/how-to-retrieve-form-data-as-array-in-golang
