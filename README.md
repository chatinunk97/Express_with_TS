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

Just a quick reminder, the reason TS recognize the req.session is because we defined it at the very top of index.ts

```
//Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cookieSession({keys : ['zxc']}))
```

And this is just to check whether the req.session has an value inside before we reach to the deeper level of the obj (preventing error)

```
if(req.session && req.session.loggedIn){}
```

Just a quick reminder of a middle ware it's a function after all

```
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.session && req.session.loggedIn) {
    next();
    return;
  } else {
    res.status(403);
    res.send("Not premitted");
  }
}
```

# Decorator : Advance TS to help improve dev exp

- JS reminder before diving in to Decorator

ES2015 Class are just syntax sugar
Behind the scene it's prototype and inherit system
(Where we use constructor function and stuffs)

Normal property like this.color = 'red' will be visible and attached to the instance of that class

However, the method that is created inside a a class will end up in a '**proto**' property which is invisible to the system

```
class Boat{
  color = 'red'
  sail = ()=>{console.log("gogo")}
}
// sail will not be visible but can be access via __proto__ (this is only the behind the scene stuff we can still normally access it via Boat.sail())
```

Then when we invoke a method inside that prototype it will then search for the obj of reference and find the matching method then execute it

_The interesting part_ is that we can still add a new method to the **CLASS** that has alredy have an instance created based on it
AND!!! It will effect and change those instance as well !!

```
class Boat{
  color = 'red'
  sail = ()=>{console.log("gogo")}
}

const boat = new Boat()
Boat.prototype.sink = function (){console.log("SINK THE SHIP")}
boat.sink() // logs 'SINK THE SHIP'

```

To drive the point home
This is what proves that

<h2>
1."Every Class we creat creates a Prototype proptery (__proto__) which stores every method associated with our Class"
</h2>
AND
<h2>
2.We can modify the Class with (class.prototype) even after we've defined the class OR even after we created an instance from it which it will effect every instance event the created instance
(This is because of the point 1)
</h2>

# Refactor the hard way Express + TS

The goal to this is to use Decorators (see in feature folder in TS repo)
Decorators can manipulate functions right ?
So we can have a method as a middleware in a class like class LoginController{}

```
postLogin(req:Request , res:Response):void{
  if(){
    ...
  }

  res.send(`<h1>Good ! You're Logged IN </h1>`)
}
```

then we add a decorator to specify the path to this method

```
const router = Router()
.
.
@post('/login')
postLogin(...)
.
.
.
.
function post(routerName : string){
  return function(target : any , key:string,desc : PropertyDescriptor){
    router.post(routerName , target[key])
  }
}
```

\*Disclaimer this is not the real code it's just the concepts
So now when we call the method postLogin we will now have to satisfy the post as well so it's working just like a controller

But problem arise when we have multiple Decorators
when we want to add in more middleware it's not quite possible to reach back into other Decorator result

# Metadata (reflect-metadata)
