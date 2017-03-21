class Parse {

  parseSqlConnectionString(connectionString) {
    const userPass = connectionString.split('@')[0];
    const hostPort = connectionString.split('@')[1];

    return {
      username: userPass.split(':')[0],
      password: userPass.split(':')[1],
      host: hostPort.split(':')[0],
      port: hostPort.split(':')[1],
    };
  }

}

module.exports = new Parse();