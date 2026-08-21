import express from "express";// supertest needs express to send a fake request 
import authRouter from "../src/auth.js"; 
import request from "supertest"; // this makes our test pretend to be a front end and send an http request 
import User from "../src/models/User.js";
jest.mock("../src/models/User.js");// so the test never touches postgres sql 
import bcrypt from "bcryptjs";
process.env.JWT_SECRET = "unit-test-secret";// signup creates a token so the test needs a jwt secret
const app = express(); // for a tiny backend test 
app.use(express.json()); 
app.use("/api/auth", authRouter); 
const mockedFindOne = User.findOne as jest.Mock;// fake findOne instead of using postgres
const mockedCreate = User.create as jest.Mock;// fake create instead of using postgres



describe("POST /signup", () => { 
  // signup test cases go here 
  beforeEach(() => {
    jest.clearAllMocks();// clears old mock behavior before every test
    mockedFindOne.mockReset();
    mockedCreate.mockReset();
  });
      test("returns 400 when all fields are missing", async() => { 
        const response = await request(app) 
        .post("/api/auth/signup") // calls the signup route 
        .send({}); // sends an empty json body to make sure the 400 response works 
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "Name, email and password are required" 
        );  
    }); 
    test("returns 400 when name only provided",async () => { 
          const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        name: "Ahmed", 
        }); 
         expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "email and password are required" 
        ); 
    }); 
     test("returns 400 when email only provided", async () => { 
          const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        email: "Ahmedk.marzouk@gmail.com", 
        }); 
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "name and password are required" 
        ); 
    }); 
     test("returns 400 when password only provided",async () => { 
            const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        password: "12345678", 
        }); 
         expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "name and email are required" 
        ); 
     
    }); 
     test("returns 400 when name and email only provided", async () => { 
          const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        name: "Ahmed", 
        email:"Ahmedk.marzouk@gmail.com" 
        }); 
         expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "password is required" 
        ); 
     
    }); 
     test("returns 400 when name and password only provided",async () => { 
          const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        name: "Ahmed", 
        password:"12345678" 
        }); 
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "email is required" 
        ); 
    }); 
     test("returns 400 when password and email only provided", async() => { 
          const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        password: "12345678", 
        email:"Ahmedk.marzouk@gmail.com" 
        }); 
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
        "name is required" 
        ); 
    }); 
 
  test("returns 400 when email format is invalid", async() => { 
        const response = await request(app) 
        .post("/api/auth/signup") // calls the signup route 
        .send({ 
           email: "invalidemail", 
          password: "Password123", 
          name:"ahmed" 
        }); 
        expect(response.status).toBe(400); 
        expect(response.body.message).toBe( 
          "Please enter a valid email address" 
        ); 
    }); 
 
  test("returns 409 when email already exists", async() => { 
        mockedFindOne.mockResolvedValue({
          id: 1,
          name: "Ahmed",
          email: "Ahmedk.marzouk2006@gmail.com",
        });// tells the fake database that this email already exists
         const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        password: "12345678", 
        email:"Ahmedk.marzouk2006@gmail.com", 
        name: "Ahmed" 
        }); 
        expect(response.status).toBe(409); 
        expect(response.body.message).toBe( 
        "Email already exists" 
        ); 
 
    }); 
 
  test("creates a new user successfully", async() => { 
      mockedFindOne.mockResolvedValue(null);// tells the fake database that this email does not exist
      mockedCreate.mockResolvedValue({
        id: 1,
        name: "Ahmed",
        email: "Ahmedk.marzouk@gmail.com",
      });// tells the fake database that the user was created successfully
      const response = await request(app) 
        .post("/api/auth/signup") 
        .send({ 
        password: "12345678", 
        email:"Ahmedk.marzouk@gmail.com", 
        name: "Ahmed" 
        }); 
        expect(response.status).toBe(201); 
        expect(response.body.message).toBe( 
        "Account created successfully" 
        ); 
    }); 
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
describe("POST /login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFindOne.mockReset();
  });

  test("returns 400 when email and password are missing", async() => {
    const response = await request(app)
    .post("/api/auth/login")
    .send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
    "email and password are required"
    );
  });

  test("returns 400 when email only provided", async() => {
    const response = await request(app)
    .post("/api/auth/login")
    .send({
      email:"Ahmedk.marzouk@gmail.com"
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
    "password is required"
    );
  });
  test("returns 400 for invalid email format", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedgmail.com",
      password: "12345678"
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Invalid email format");
});

test("returns 400 for invalid password format", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedk.marzouk@gmail.com",
      password: "1234"
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe(
    "Password must be at least 8 characters"
  );
});

  test("returns 400 when password only provided", async() => {
    const response = await request(app)
    .post("/api/auth/login")
    .send({
      password:"12345678"
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
    "email is required"
    );
  });

  test("returns 400 when email format is invalid", async() => {
    const response = await request(app)
    .post("/api/auth/login")
    .send({
      email:"invalidemail",
      password:"12345678"
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
    "Invalid email format"
    );
  });

  test("returns 401 when user does not exist", async() => {
    mockedFindOne.mockResolvedValue(null);// tells the fake database that the email does not exist
    const response = await request(app)
    .post("/api/auth/login")
    .send({
      email:"Ahmedk.marzouk@gmail.com",
      password:"12345678"
    });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe(
    "Invalid email or password"
    );
  });

 test("returns 401 when password is incorrect", async () => {
  const hashedPassword = await bcrypt.hash("correctpassword", 12);
  // Creates a real bcrypt hash for the actual correct password.
  mockedFindOne.mockResolvedValue({
    id: 1,
    name: "Ahmed",
    email: "Ahmedk.marzouk@gmail.com",
    passwordHash: hashedPassword
  });
  // Fake database user stores the real hash.
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedk.marzouk@gmail.com",
      password: "wrongpassword"
    });
  // User enters a different password from the one that was hashed.
  expect(response.status).toBe(401);
  expect(response.body.message).toBe(
    "Invalid email or password"
  );
});

test("accepts a valid email format", async () => {
  mockedFindOne.mockResolvedValue(null);
  // Fake database says the user does not exist.
  // This lets us know the request passed email validation and reached User.findOne().
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedk.marzouk@gmail.com",
      password: "12345678"
    });
  // Both email and password formats are valid.
  expect(response.status).toBe(401);
  // 401 is expected because our fake database says the user does not exist.
  // Most importantly, it did NOT return 400 for invalid email format.
  expect(response.body.message).toBe(
    "Invalid email or password"
  );
}); // this is to test that the controller rejects the request which then wont go to the database to check the password

  test("accepts a valid email format", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedk.marzouk@gmail.com",
      password: "12345678"
    });

  expect(response.status).not.toBe(400);
  // Means the email format itself did not fail validation
});
test("accepts a valid password format", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "Ahmedk.marzouk@gmail.com",
      password: "12345678"
    });

  expect(response.status).not.toBe(400);
  // Means the password format itself did not fail validation
});
});
