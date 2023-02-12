const express = require('express');
const cors = require('cors');
const app = express();
const vis = require('vis-network')

app.use(cors());
app.use(express.json());

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://52.207.255.177:7687", neo4j.auth.basic("neo4j", "magneto-june-towns"));
const session = driver.session();

app.get('/find-node', (req, res) => {
    const { selectedNodeType, selectedLevel, title, name } = req.query;
    // const sel = req.params
  
    // console.log(sel)
    // let query = "";
    if (selectedNodeType === "Movie") {
      
      if(selectedLevel === '1'){
        query = `MATCH (m:Movie) WHERE m.title = "${title}" RETURN m`;
      }
      else if(selectedLevel === '2'){
        query = `MATCH (m:Movie{title:'${title}'}), (p:Person), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
      }
      else[
        query = `MATCH (m:Movie{title:'${title}'}), (p:Person),(m1:Movie), (m1)<-[r1:ACTED_IN|DIRECTED]-(p)-[r:ACTED_IN|DIRECTED]->(m)
        RETURN m,p,r,r1,m1`
      ]
      
    } 
    else if (selectedNodeType === "Person") {
      if(selectedLevel === '1'){
        query = `MATCH (p:Person) WHERE p.name = "${name}" RETURN p`;
      }
      else if(selectedLevel === '2'){
        query = `MATCH (p:Person{name:'${name}'}), (m:Movie), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
      }
      else{
        query = `MATCH (p:Person{name:'${name}'}), (m:Movie),(p1:Person), (p)<-[r1:ACTED_IN|DIRECTED]->(m)<-[r:ACTED_IN|DIRECTED]-(p1)
        RETURN m,p,r,r1,p1`
      }
    }
    else if (selectedNodeType === "User"){
      if(selectedLevel === '1'){
        query = `MATCH (u:User) WHERE u.name = "${name}" RETURN u`;
      }
      else if(selectedLevel === '2'){
        query = `MATCH (u:User{name:'${name}'}), (m:Movie), (u)-[r:RATED]-(m) RETURN m,u,r limit 10`;
      }
    }
    else if (selectedNodeType === "Genre"){
      if(selectedLevel === '1'){
        query = `MATCH (g:Genre) WHERE g.name = "${name}" RETURN g`;
      }
      else if(selectedLevel === '2'){
        query = `MATCH (g:Genre{name:'${name}'}), (m:Movie), (g)-[r:IN_GENRE]-(m)
        where m.imdbRating > 8
        RETURN m,g,r`;
      }
    }
    session
        .run(query)
        .then((result)=>{
          data = []
          result.records.forEach((record) => { 
              
              // data.push(record._fields[0].properties);
          });
          // console.log(result.records) 
          // console.log(req.query)

           
          res.json(result.records)
            // res.redirect('/');
        })
      .catch(error => {
        console.log(error)
        
      });
  });



  app.get('/find-path', (req,res) => {
    query = ''
    const { selectedNodeType, selectedNodeType1, name, title, name1, title1 } = req.query;
    console.log(req.query)
    if(selectedNodeType === selectedNodeType1){
      if(selectedNodeType === 'Movie'){
        query = `match path = shortestPath((m:Movie{title:'${title}'})-[:ACTED_IN|DIRECTED*1..20]-(m1:Movie{title:'${title1}'}))
        return path
        ` 
      }
      else{
        query = `match path = shortestPath((p:Person{name:'${name}'})-[:ACTED_IN|DIRECTED*1..20]-(p1:Person{name:'${name1}'}))
        return path`
      }
    }
    else{
      if(selectedNodeType === 'Movie'){
        query = `match path = shortestPath((m:Movie{title:'${title}'})-[:ACTED_IN|DIRECTED*1..20]-(p1:Person{name:'${name1}'}))
        return path`
      }
      else{
        query = `match path = shortestPath((p:Person{name:'${name}'})-[:ACTED_IN|DIRECTED*1..20]-(m1:Movie{title:'${title1}'}))
        return path`
      }
    }
    

    session
    .run(query)
    .then((result)=>{
      data = []
      result.records.forEach((record) => { 
          
          // data.push(record._fields[0].properties);
      });
      // console.log(result.records) 
      // console.log(req.query)

       
      res.json(result.records)
        // res.redirect('/');
    })
  .catch(error => {
    console.log(error)
    
  });
    
    


  })
  app.get('/group-nodes', (req,res) => {
    
  })

  app.post("/register", (req, res) => {
    // Read the user's information from the request body
    const { username, password } = req.body;
  
    // Hash the password for security
    const hash = bcrypt.hashSync(password, 10);
  
    // Store the user in the database
    session
      .run(`CREATE (u:User { username: $username, password: $hash })`, { username, hash })
      .then(() => {
        res.status(201).json({ message: "User created" });
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
      });
  });

  app.post("/login", (req, res) => {
    // Read the user's information from the request body
    const { username, password } = req.body;
  
    // Check if the user exists
    session
      .run(`MATCH (u:User { username: $username }) RETURN u.password`, { username })
      .then((result) => {
        if (!result.records.length) {
          return res.status(401).json({ message: "Incorrect username or password" });
        }
  
        // Compare the hashed password
        const hash = result.records[0].get("u.password");
        if (!bcrypt.compareSync(password, hash)) {
          return res.status(401).json({ message: "Incorrect username or password" });
        }
  
        // Create a JWT token
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
        // Return the token to the client
        res.json({ token });
      })
      .catch((error) => {
        res.status(400).json({ message: error.message });
      });
  });






  app.get('/expand-node', (req,res) => {
    query = ''
    const { title, label } = req.query;
    console.log(title, label)
    if(title === 'Movie'){
      query = `MATCH (m:Movie{title:'${label}'}), (p:Person), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`;
    }
    else if(title === 'Person' || title === 'Actor' || title === 'Director'){
      query = `MATCH (p:Person{name:'${label}'}), (m:Movie), (p)-[r:ACTED_IN|DIRECTED]-(m) RETURN m,p,r`
    } 


    session
    .run(query)
    .then(result => {
      res.json(result.records)
    })
    .catch(error => {
      console.log(error)
    })
  })
  


  const users = [
    { id: 1, name: 'User 1', role: 'user' },
    { id: 2, name: 'User 2', role: 'user' },
    { id: 3, name: 'User 3', role: 'user' },
  ];
  
  // Route to get all users
  app.get('/users', (req, res) => {
    res.json(users);
  });
  
  // Route to update the role of a user
  app.put('/users/:id/role', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
  
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
  
    user.role = req.body.role;
    res.json(user);
  });






  

  

app.listen(3000, () => {   
  console.log('Server running on port 3000');
});






//     query = `match(p:Actor{name:"Keanu Reeves"}), (m:Movie), (p1:Person),
// (p)-[r:ACTED_IN|DIRECTED]-(m), (p1)-[r1:ACTED_IN|DIRECTED]-(m)
// return p,p1,m,r,r1`
// query = `match(p:Person{name:"Keanu Reeves"}),(p1:Person{name:"Tom Hanks"})return shortestPath((p)-[*]-(p1))`
      // query = `match(par:Person{name:"Tom Hanks"}), (maf:Movie), (par)-[r:ACTED_IN|DIRECTED]-(maf) return maf,par,r`
