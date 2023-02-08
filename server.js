const express = require('express');
const cors = require('cors');
const app = express();
const vis = require('vis-network')

app.use(cors());
app.use(express.json());

const neo4j = require("neo4j-driver");
const driver = neo4j.driver("bolt://52.207.255.177:7687", neo4j.auth.basic("neo4j", "magneto-june-towns"));
const session = driver.session();

app.post('/find-node', (req, res) => {
    const { selectedNodeType, selectedLevel, title, name } = req.body;
  
    // let query = "";
    // if (selectedNodeType === "Movie") {
    //   query = `MATCH (m:Movie) WHERE m.title = "${title}" RETURN m`;
    // } else if (selectedNodeType === "Person") {
    //   query = `MATCH (p:Person) WHERE p.name = "${name}" RETURN p`;
    // }

    if(req.body.selectedNodeType === 'Person'){
      console.log('you select the person node')
      if(req.body.selectedLevel === '1'){
        query = `MATCH (p:Person) WHERE p.name = "${name}" RETURN p`;
      }
      else{
        query = `MATCH (p:Person{name:'${name}'}), (m:Movie), (p)-[a:ACTED_IN|DIRECTED]-(m) RETURN m`;
      }
      

    }
    else{
      query = `MATCH (m:Movie) WHERE m.title = "${title}" RETURN m`;
    }
    session
        .run(query)
        .then((result)=>{
            data = []
            result.records.forEach((record) => { 
                console.log(record._fields[0].properties);
                // data.push(record._fields[0].properties);
            });
            res.redirect('/');
        })
      .catch(error => {
        console.log(error)
        
      });
  });
  

  

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
