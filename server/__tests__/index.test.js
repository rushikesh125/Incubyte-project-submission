import request from "supertest";

import app from "../index.js"

describe('Heath Check',()=>{
    it('should return 200 with "Hello , everything is Ok" msg',async()=>{
        const res = await request(app).get('/').expect(200);
        expect(res.body).toHaveProperty('msg',"Hello , Everything is Ok");
    })
})