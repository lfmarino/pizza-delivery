# Pizza Delivery API

This API is designed for create, edit and delete the customers, and for manage their orders

## Users
### Create
~~~
URL: localhost:3000/user
Method: POST
~~~
#### Parameters
```JSON
{ 
  "firstName": "User's first name",
  "lastName": "User's first name",
  "password": "user's password",
  "email": "user's email",
  "streetAddress": "user's street address"
}
```
---
### Login
~~~
URL: localhost:3000/login
Method: POST
~~~
#### Parameters
```JSON
{ 
  "email": "user's email",
  "password": "user's password"
}
```

#### Response
```JSON
{ 
  "id": "token id",
  "email": "user's email",
  "expires": "timestamp representing the validation of the token"
}
```
>**NOTE:** the token id received in this endpoint must be used for all the request that need an authentication. it must be sent in the header with the parameter name "token" (see requests below)

---
### Logout
~~~
URL: localhost:3000/logout
Method: post
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email"
}
```
---
### Update
~~~
URL: localhost:3000/user
Method: PUT
Headers: token
~~~
#### Parameters
```JSON
{ 
  "firstName": "User's first name",
  "lastName": "User's first name",
  "password": "user's password",
  "email": "user's email",
  "streetAddress": "user's street address"
}
```
---
### Delete
~~~
URL: localhost:3000/user
Method: DELETE
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email"
}
```
---
## Shopping Carts
### View Items
~~~
URL: localhost:3000/menu
Method: GET
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email"
}
```
>**NOTE:** The parameter *email* must be sent by query string
---
### Add Item
~~~
URL: localhost:3000/carts
Method: POST
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email",
  "itemId": "id of the item to add in the cart"
}
```
---
### Remove Item
~~~
URL: localhost:3000/carts
Method: DELETE
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email",
  "itemId": "id of the item to remove in the cart"
}
```
---
## Create Order
~~~
URL: localhost:3000/order
Method: POST
Headers: token
~~~
#### Parameters
```JSON
{ 
  "email": "user's email"
}
```
---