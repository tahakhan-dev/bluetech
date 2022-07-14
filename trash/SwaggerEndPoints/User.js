module.exports = function (app) {
	
    app.get('/api/User/', (req, res) => {
        // #swagger.tags = ['User']
        // #swagger.description = 'Endpoint para obter um usuário.'
        // #swagger.parameters['id'] = { description: 'ID do usuário.' }

        /* #swagger.parameters['filtro'] = {
               description: 'Um filtro qualquer.',
               type: 'string'
        } */
        // const filtro = req.query.filtro

        return res.send(res);

    })

}