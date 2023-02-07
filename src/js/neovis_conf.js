const neo4j = require('neo4j-driver.v1');
const driver = neo4j.driver("bolt://3.88.116.198:7687", neo4j.auth.basic("neo4j", "photos-troubleshooters-chalk"));
const session = driver.session();

session
  .run('MATCH (n) RETURN n')
  .then(result => {
    // process the result to extract the data you want to visualize
  })
  .catch(error => {
    console.log(error);
  })
  .finally(() => {
    session.close();
    driver.close();
  });