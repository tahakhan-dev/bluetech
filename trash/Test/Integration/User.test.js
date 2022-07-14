const { beforeEach, afterEach, it, describe ,expect} = require('@jest/globals');
const request = require('supertest');
let server;
const bcrypt = require('bcrypt');
const _ = require('lodash');

const {User} = require('../../Models/UserModel');

describe('Users Module',() => {
    
    beforeEach(() => {
        server = require('../../index');
    });
    afterEach(async () => {
        server.close();
        await User.remove({});
    });

    describe('GET /',() => {

        it("It Should Return All Users", async () => {

            const example1 = "example1";
            const example2 = "example2";

            const salt = await bcrypt.genSalt(10);
            
            User.collection.insertMany([
                    {
                        "name" : "Saad Jawaid",
                        "email" : "saadbandukada@gmail.com",
                        'number' : "03101041372",
                        "password" : await bcrypt.hash(example1,salt)
                    },
                    {
                        "name" : "Ali Hussain",
                        "email" : "alihussain@gmail.com",
                        'number' : "03101042213",
                        "password" : await bcrypt.hash(example2,salt)
                    }

            ]);

        const response = request(server).get('/api/user/');
        expect((await response).status).toBe(200);
        expect((await response).body.length).toBe(2);
        expect((await response).body.some(u => u.name === "Saad Jawaid")).toBeTruthy();

        });

    });

});