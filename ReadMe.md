
# API - Nutrisee

This repository contains the source code and documentation for the API service Nutrisee APP.

if you want try here the url :
- ```https://backend-dot-nutrisee-c23-ps394.et.r.appspot.com/``` user API
- ```https://ml-model-l7aquw2uhq-et.a.run.app/recommend ``` ML Model Endpoint

## Table of Contents

- [Installation](#installation)
- [Endpoints](#endpoints)

## Installation

To install and run the API locally, please follow these steps:

1. Clone this repository to your local machine
2. Install the required dependencies by running the following command: ```npm install --omit=dev ```
3. Before running the API, please do configuration in the folder config : 
```
.
├── ...
├── config
│   ├── cloud-storage.js    # Ignore this one
│   ├── database.js         # Config Your Database           
│   └── firebase.js         # Config Your firebase API Key and Service Account
├── serviceAccountKey.json   # this is where your service Account or change directory location based on your directory
└── ...
```
4. After do configuration, start the API server by running the following command: ```npm start```
5. Last, also start the API server for ML Model by running the following command inside 'mlModels' directory: ```python```

## Endpoints

The API provides the following endpoints:

- **`/api/signup`**: Allows user to create new account. (Method: POST)
- **`/api/login`**: Login or Sign in user (Method: POST)
- **`/api/logout`**: Revoke user in current session (Method: POST)
- **`/api/profile`**: Get user information
- **`/api/update`**: Insert or update user information (Method PUT)
Example request Body **`/api/update`**
```
{
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23",
    "user_id": "J5UTFCn9Eja4"
}

or

{
    "height": 20,
    "weight": 21,
    "birth": "2000-07-23",
    "user_id": "J5UTFCn9Eja4",
    "allergy_id": [
      {
       "id": 1,
       "name": "peanut"
      }
    ],
    "allergy_name": [{
      "name": "cat"
    }]
}
 ```
- **`/api/allergy`**: Get list Allergy in database
- **`/api/history`**: Insert, update or get user food history (Method: PUT)
Example Request Body **`/api/history`** Method: PUT
```
{
    "breakfast": "Bakso",
    "lunch": null,
    "dinner": null,
}
 ```
- **`/recommend`**: To get recommendation food (Method : POST)
Example Request Body **`/api/history`** Method: PUT
```
{
  "weight": 80,
  "height": 160,
  "age": 21,
  "gender": "female",
  "allergies": ["Ayam", "Tauge"]
}
 ```

 #### Note
 - If you want try to use the deployed don't forget to set cookies session=[your Token] for every request except ```/recommend```, ```/allergy```, ```/signup``` and ```/login```

