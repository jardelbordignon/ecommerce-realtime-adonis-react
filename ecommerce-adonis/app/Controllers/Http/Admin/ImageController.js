'use strict'

const Image = use('App/Models/Image')
const { manage_single_upload, manage_multiple_upload } = use('App/Helpers')
const fs = use('fs')

class ImageController {

  async index ({ response, pagination }) {
    const images = await Image.query()
      .orderBy('id', 'DESC')
      .paginate(pagination.page, pagination.perPage)

    return response.send(images)
  }


  async store ({ request, response }) {
    try {
      const fileJar = request.file('images', { types: ['image'], size: '2mb' })

      let images = []

      if (!fileJar.files) { // apenas um arquivo
        const file = await manage_single_upload(fileJar)
        if (file.moved()) {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(image)

          return response.status(201).send({ successes: images, errors: {} })
        }

        return response.status(400).send({ message: 'Erro ao processar a imagem' })

      } else { // varios arquivos
        const files = await manage_multiple_upload(fileJar)

        await Promise.all( async file => {
          const image = await Image.create({
            path: file.fileName,
            size: file.size,
            original_name: file.clientName,
            extension: file.subtype
          })

          images.push(image)
        })
      }

      return response.status(201).send({ successes: images, errors: files.errors })

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao registrar imagem'})
    }
  }


  async show ({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    return response.send(image)
  }


  async update ({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    try {
      const original_name = request.input('original_name')
      image.merge({ original_name })
    } catch (error) {
      return response.status(400).send({ message: 'Erro ao editar a imagem'})
    }
  }


  async destroy ({ params, request, response }) {
    const image = await Image.findOrFail(params.id)
    try {
      const filePath = Helpers.publicPath(`uploads/${image.path}`)

      fs.unlinkSync(filePath)
      await image.delete()

      return response.status(204).send()

    } catch (error) {
      return response.status(400).send({ message: 'Erro ao deletar a imagem'})
    }
  }

}

module.exports = ImageController
