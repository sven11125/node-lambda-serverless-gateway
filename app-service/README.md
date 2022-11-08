# APP API

app-service

## Getting started

In order to run the services locally, `serverless-offline` plugin is required

## Offline Invocation

```sh
npm install
serverless offline
```

---

## Functions

### GET APP

- **URL**: `/apps/{appId}`
- **METHOD**: `GET`
- **PATH PARAMS**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**

```json
{
  "success": true,
  "message": "App retrieved successfully!",
  "data": {
    "appId": "randomapp.near",
    "name": "app name",
    "tags": [],
    "category": "randomcategory.near",
    "appUrl": "<appurl>",
    "appCallbackUrl": "<appcallbackurl>",
    "usersCount": 1,
    "downloadsCount": 4,
    "version": "4",
    "developer": "rahul",
    "status": "done",
    "isActive": "true"
  }
}
```

### LIST

- **URL**: `/apps`
- **METHOD**: `GET`
- **PATH PARAMS**: N/A
- **QUERY PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:

```json
{
  "success": true,
  "message": "Apps retrieved successfully!",
  "data": [
    {
      "appId": "randomapp.near",
      "name": "app name",
      "tags": [],
      "category": "randomcategory.near",
      "appUrl": "<appurl>",
      "appCallbackUrl": "<appcallbackurl>",
      "usersCount": 1,
      "downloadsCount": 4,
      "version": "4",
      "developer": "rahul",
      "status": "done",
      "isActive": "true"
    }
  ]
}
```

### CREATE

- **URL**: `/apps`
- **METHOD**: `POST`
- **PATH PARAMS**: N/A
- **QUERY PARAMS**: N/A
- **REQUEST BODY**:

```json
{
  "name": "app name",
  "tags": [],
  "category": "randomcategory.near",
  "appUrl": "<appurl>",
  "appCallbackUrl": "<appcallbackurl>",
  "usersCount": 1,
  "downloadsCount": 4,
  "version": "3",
  "developer": ""
}
```

- **RESPONSE BODY**:

```json
{
  "success": true,
  "message": "App successfully created!",
  "data": {
    "name": "app name",
    "tags": [],
    "category": "randomcategory.near",
    "appUrl": "<appurl>",
    "appCallbackUrl": "<appcallbackurl>",
    "usersCount": 1,
    "downloadsCount": 4,
    "version": "3",
    "developer": "",
    "appId": "JfVx4-FHYJjFdgn9WKwLk"
  }
}
```

### UPDATE

- **URL**: `/apps/{appId}`
- **METHOD**: `PUT`
- **PATH PARAMS**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: N/A
- **REQUEST BODY**:

```json
{
  "name": "xyxzzz",
  "tags": [],
  "category": "Gaming",
  "appUrl": "https://www.ggogle.com",
  "appCallbackUrl": "",
  "usersCount": 1,
  "downloadsCount": 4,
  "version": "3",
  "developer": ""
}
```

- **RESPONSE BODY**:

```json
{
  "success": true,
  "message": "App Updated successfully!",
  "data": {
    "appId": "3",
    "name": "app name",
    "tags": [],
    "category": "randomcategory.near",
    "appUrl": "<appurl>",
    "appCallbackUrl": "<appcallbackurl>",
    "usersCount": 1,
    "downloadsCount": 4,
    "version": "4",
    "developer": "rahul",
    "status": "done",
    "isActive": "true"
  }
}
```

### DELETE

- **URL**: `/apps/{appId}`
- **METHOD**: `DELETE`
- **PATH PARAMS**:

```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: N/A
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:

```json
{
  "success": true,
  "message": "App Deleted successfully!"
}
```

### Retrieve App by Category

- **URL**: ` /apps/category?search={appCategory}`
- **METHOD**: `GET`
- **PATH PARAMS**: 
- **QUERY PARAMS**: `Key=search Value=appCategory`
- **REQUEST BODY**: N/A
- **RESPONSE BODY**:

```json
{
    "appId": "_0iM8scD5fkKFi6l9tMo0",
    "userId": "qcQWJFHkfjfhjdkdl",
    "appName": "ate1rwtestetwerr.testnet",
    "appDescription": "my awesome app",
    "appIcon": "path/to/app/icon",
    "noOfUsers": "15",
    "appCategory": "{appCategory}",
    "appDeveloper": "primelab",
    "appVersion": "0.0.2",
    "created": "YYYY-MM-ddTHH:mm:ss.SSSZ",
    "updated": "YYYY-MM-ddTHH:mm:ss.SSSZ"
}
```

### Share APP

- **URL**: ` /apps/share/{userId}?app={appId}`
- **METHOD**: `POST`
- **PATH PARAMS**: 
- **QUERY PARAMS**: `Key=app Value=appId`
- **REQUEST BODY**: N/A
```json
{
    "shareLink": "https://get_app/download/appId.link"
}
```

- **RESPONSE BODY**:

```json
{
    "shareLink": "https://get_app/download/appId.link"
}
```


### View App Recent History

- **URL**: ` /apps/history?search={recent}`
- **METHOD**: `GET`
- **PATH PARAMS**: 
- **QUERY PARAMS**: `Key=search Value=recent`
- **REQUEST BODY**: N/A

- **RESPONSE BODY**:

```json
{
    "recent_apps": [
        {
            "appId": "_0iM8scD5fkKFi6l9tMo0",
            "userId": "qcQWJFHkfjfhjdkdl",
            "appName": "ate1rwtestetwerr.testnet",
            "appDescription": "my awesome app",
            "appIcon": "path/to/app/icon",
            "noOfUsers": "15",
            "appCategory": "docusign app",
            "appDeveloper": "primelab",
            "appVersion": "0.0.2",
            "created": "YYYY-MM-ddTHH:mm:ss.SSSZ",
            "updated": "YYYY-MM-ddTHH:mm:ss.SSSZ"
        },
        {
            "appId": "dfhdhdhhjdhjdhjvhdh",
            "userId": "dgm_dlksflkka",
            "appName": "testApp.testnet",
            "appDescription": "my awesome app 2",
            "appIcon": "path/to/app/icon",
            "noOfUsers": "20",
            "appCategory": "web3 popular app",
            "appDeveloper": "primelab",
            "appVersion": "0.0.2",
            "created": "YYYY-MM-ddTHH:mm:ss.SSSZ",
            "updated": "YYYY-MM-ddTHH:mm:ss.SSSZ"
        }
    ]
}
```


### View Contact App History

- **URL**: ` /apps/activity?app={appId}&contact={contactId}`
- **METHOD**: `GET`
- **PATH PARAMS**: 
- **QUERY PARAMS**: 

`Key=app Value={appId}`
`Key=contact Value={contactId}`

- **REQUEST BODY**: N/A

- **RESPONSE BODY**:

```json
{
    "appId": "my_test_wallet_id",
    "contactId": "{contactId}",
    "activity": {
        "type": "testing",
        "date": 1642440803928,
        "description": "testing_apps"
    }
}
```

### List App Activity

- **URL**: ` /apps/activity/{appId}`
- **METHOD**: `GET`
- **PATH PARAMS**: 
```json
{
  "appId": "DGWS4dPa8dejsDNMMlwzg"
}
```

- **QUERY PARAMS**: 

- **REQUEST BODY**: N/A

- **RESPONSE BODY**:

```json
[
    {
        "appId": "my_test_wallet_id",
        "userId": "KWNCXqjwZgdVOlq_p4GTS",
        "contactId": "AKDWD55kdgjlb_gjTIG",
        "activity": {
            "type": "testing",
            "date": 1642440803928,
            "description": "testing_apps"
        }
    }
]
```
