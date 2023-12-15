# Setting up Express

install Express and cookie-session : this is use to track whether the user is logged in or not

Don't forget, if we are using a 3rd party library
we need a type definition file for that library
Most of the time it's the below,

```
@types/~libraryName~
```

# Capital Filename in TS means exporting a Class

# Encoding HTML form type , spoiler it's not JSON

```
application/x-www-form-urlencoded is a MIME type (Multipurpose Internet Mail Extensions) used to encode form data as key-value pairs. When you submit an HTML form without specifying the enctype attribute, it defaults to application/x-www-form-urlencoded.
```

This is why in our express configuration (in index.ts)
we can't just use

```
app.use(express.json())
```

Because the information type we are getting from HTML is `application/x-www-form-urlencoded`
not JSON
In short you can call it `urlencoded`

Rembmer without the body-parser or express.json()
There wouldn't be any body property inside the request
(This is the different 'body' HTML does have 'body' but not the 'body property' in the obj)

# Middleware, a counter productive for TypeScript

1. Middlewares like above modify ,add , remove property of an object. Making TS unable to predict the obj structure after the obj comes out of middlewares.
   Ex. like the property 'body' mentioned above

2. Type definition file : sometime it's just wrong like for Request interface, it says that there will be a property named 'body' which it woudn't exist if we didn't use the body-parser. See the problem ? The author of the type def file is assuming we use the parser.

3. Input to server : We can't predict every single input from outsiders to be in a specified form

The solution (NOT IDEAL) : We may want to change the type definition file , but it's not common. Then we can use type guard or other ways to strict the data in endpoint

THE REAL SOLUTION : Extend the given interface given from the type def file

```
interface RequestWithBody extends Request {
  body: { [key: string]: string | undefined };
}
.
.
.
.
router.post("/login", (req: RequestWithBody, res: Response) => {
  const { email, password } = req.body;

  if(email){
    res.status(202).send(email)
  }else{
    res.status(422).send("You must provide an Email")
  }
});
```

Now we can extend the original interface to be what we think it should have, in this case , a obj with propety name 'body' that has 1 or more keypairvalue

And we need to type guard it because we said the value 'can' be undefined so doing so will garentee that in the 'if' part there would be 'email' to display

# Sessions in Express

This add a 'session' property to the request obj
However, the cookie session type def file works just fine

At the index.ts we write this to use cookie-session to keep the user data

```
app.use(cookieSession({keys : ['zxc']}))
```

And since the type definition file is well-written it will know that
the 'req.session' will be created and what the value should look like

```
 req.session = 123
```

So if we try this it will throw an error cause 123 does not match the type `CookieSessionObject`
(Check in cookie-session type definition file)
On the other hand, express type def file says that 'req.body' can be anything (any type) => which does not help us to see the error that good
So the original express type def file we can do something like req.body.email - 100 and it will not tell us anything

# cookie-session

It will create us a req.session property and then
if we assign anything to it it will be kept as a cookie in our browser just like those tokens

- Add cookie then redirect

```
 req.session = { loggedIn: true };
    res.redirect("/");
```

- Remove cookie then redirect (logout)

```
  req.session = undefined
    res.redirect('/')
```
