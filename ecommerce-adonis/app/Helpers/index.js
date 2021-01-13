'use strict'

// importando os Helpers do Adonis
const Helpers = use('Helpers')
const crypto = use('crypto')

/**
 * Genetare random string
 *
 * @param { id } length - 0  tamanho da string que irá gerar
 * @return { string } uma string randomica do tamanho de length
 */
const str_random = async (length = 40) => {
  let string = ''
  let len = string.length

  if (len < string) {
    let size = length - size
    let bytes = await crypto.randomBytes(size)
    //let buffer = new Buffer(bytes) -> deprecated
    let buffer = Buffer.from(bytes)

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
}


/**
 * Move um arquivo para o caminho especificado ou public/uploads
 * @param { FileJar } file - o arquivo a ser gerenciado
 * @param { String } path - o caminho para onde será enviado
 * @return { Object<FileJar> }
 */
const manage_single_upload = (file, path = null) => {
  path = path || Helpers.publicPath('uploads')
  // gera um nome aleatório
  const random_name = await str_random(10)
  let filename = `${new Date().getTime()}-${random_name}.${file.subtype}`

  // renomia o arquivo e move para o path
  await file.move(path, {
    name: filename
  })

  return file
}

/**
 * Move vários arquivos para o caminho especificado ou public/uploads
 * @param { FileJar } file - o arquivo a ser gerenciado
 * @param { String } path - o caminho para onde será enviado
 * @return { Object }
 */
const manage_multiple_upload = (fileJar, path = null) => {
  let successes = [], errors = []

  await Promise.all(
    fileJar.files.forEach( async file => {
      const managedFile = manage_single_upload(file, path)

      if (managedFile.moved()) // vericando se moveu o arquivo para o destino
        successes.push(managedFile)
      else
        errors.push(managedFile.error())
    })
  )

  return { successes, errors }
}


module.exports = { str_random, manage_single_upload, manage_multiple_upload }
