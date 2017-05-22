export class DataSetLoader {

  static loadByRegion(region) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest()
      req.onload = () => {
        if (req.readyState == 4 && req.status == 200) {
          try {
            resolve(JSON.parse(req.responseText))
          } catch (err) {
            reject(err)
          }
        }
      }

      req.onerror = () => {
        reject(req.statusText)
      }

      req.open('GET', `./dist/${region}.json`, true)
      req.send(null)
    })
  }
}
