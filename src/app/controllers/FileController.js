import File from '../models/File';

class FileController {
  async store(request, response) {
    const { filename: path, originalname: name } = request.file;

    const { id } = await File.create({ path, name });

    return response.json({ id, path, name });
  }
}

export default new FileController();
