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
    let buffer = new Buffer(bytes)

    string += buffer
      .toString('base64')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substr(0, size)
  }

  return string
}
