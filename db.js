const {PrismaClient} = require("@prisma/client")

class DBClient {
  static instance = null;

  /**
   * @returns {PrismaClient}
   */
  static getInstance(){
    if (DBClient.instance == null) {
      DBClient.instance = new PrismaClient();
    }
    
    return DBClient.instance;
  }
}

module.exports = DBClient