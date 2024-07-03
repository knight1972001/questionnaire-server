const request = require("supertest");
const server = require("../../index");

describe("GET /", () => {
  it("should return status code 200", async () => {
    const response = await request(server).get("/");
    expect(response.statusCode).toBe(200);
  });

  it("shoudl return 404", async () => {
    const response = await request(server).get("/not-exist");
    expect(response.statusCode).toBe(404);
  });

  it("should return status code 200 and question length is 20", async () => {
    const response = await request(server).get("/questions");
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(20);
  });
});

describe("GET /questions/:id", () => {
  it("should return status code 200 and question id 1", async () => {
    const response = await request(server).get("/questions/1");
    expect(response.statusCode).toBe(200);
    expect(response.body.id).toBe(1);
  });

  it('should return status code 404 and json status: "Question not found"', async () => {
    const response = await request(server).get("/questions/non-exist");
    expect(response.status).toBe(404);
    // Check response body content
    expect(response.body).toEqual({ error: "Question not found" });
  });
});

describe("POST /submit", () => {
  it("should return status code 200 and calculate total points correctly for valid submission", async () => {
    const answers = [
      { id: 1, answer: ["Python", "Java"] },
      {
        id: 2,
        answer: {
          1: "C",
          2: "Python",
          3: "JavaScript",
          4: "Go",
        },
      },
    ];

    const response = await request(server)
      .post("/submit")
      .send(answers)
      .set("Accept", "application/json");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 2 }); // Adjust expected points based on your test data
  });

  it("should return status code 400 for invalid submission format", async () => {
    const invalidAnswers = { id: 1, answer: "Invalid Answer Format" }; // Not an array

    const response = await request(server)
      .post("/submit")
      .send(invalidAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid submission format. Expected an array of answers.",
    });
  });

  it("should return status code 200 with 0 points for empty array", async () => {
    const emptyAnswers = [];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 0 });
  });

  // id: 4. What is capital of Thailand: Bangkok
  it("should return status code 200 with 1 points for text answer Lower/Upper Case", async () => {
    const emptyAnswers = [{ id: 4, answer: "bangkok" }];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 1 });
  });

  // id: 4. What is capital of Thailand: Bangkok
  it("should return status code 200 with 0 points for wrong text answer Lower/Upper Case", async () => {
    const emptyAnswers = [{ id: 4, answer: "Hanoi" }];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 0 });
  });

  // id: 5. Which of the following are cloud service providers?: ["AWS", "Azure", "GCP"]
  it("should return status code 200 with 1 points for not in order array answer", async () => {
    const emptyAnswers = [{ id: 5, answer: ["GCP", "Azure", "AWS"] }];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 1 });
  });

  // id: 3. Is Python an interpreted language?: Yes
  it("should return status code 200 with 0 points for Wrong radio answer", async () => {
    const emptyAnswers = [{ id: 3, answer: "No" }];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 0 });
  });

  // id: 3. Is Python an interpreted language?: Yes
  it("should return status code 200 with 1 points for correct radio answer", async () => {
    const emptyAnswers = [{ id: 3, answer: "Yes" }];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 1 });
  });

  // id: 6. Match the database type with its characteristic. "SQL": "Structured data","NoSQL": "Unstructured data"
  it("should return status code 200 with 1 points for correct matching not in order answer", async () => {
    const emptyAnswers = [
      {
        id: 6,
        answer: {
          NoSQL: "Unstructured data",
          SQL: "Structured data",
        },
      },
    ];

    const response = await request(server)
      .post("/submit")
      .send(emptyAnswers)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ points: 1 });
  });
});

afterAll((done) => {
  server.close(done);
});
