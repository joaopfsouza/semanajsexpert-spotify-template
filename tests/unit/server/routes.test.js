import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_util/testUtil.js'

const {
    pages,
    location,
    constants: {
        CONTENT_TYPE
    }
} = config

describe('#Routes - test site for api reponse', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    test('GET / - should redirect to home page', async () => {
        const params = TestUtil.defaulHandleParams()
        params.resquest.method = 'GET'
        params.resquest.url = '/'

        await handler(...params.values())
        expect(params.response.writeHead).toBeCalledWith(
            302,
            {
                'Location': location.home
            }
        )
        expect(params.response.end).toHaveBeenCalled()
    })

    test(`GET /home - should response with ${pages.homeHTML} file stream`, async () => {
        const params = TestUtil.defaulHandleParams()
        params.resquest.method = 'GET'
        params.resquest.url = '/home'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: ''
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /controller - should response with ${pages.controllerHTML}`, async () => {
        const params = TestUtil.defaulHandleParams()
        params.resquest.method = 'GET'
        params.resquest.url = '/controller'
        const mockFileStream = TestUtil.generateReadableStream(['data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: ''
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /index.html - should response with file stream`, async () => {
        const params = TestUtil.defaulHandleParams()
        const filename = 'index.html'
        params.resquest.method = 'GET'
        params.resquest.url = filename
        const expectType = '.html'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectType
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).toHaveBeenCalledWith(200, {
            'Content-Type': CONTENT_TYPE[expectType]
        })
    })


    test(`GET /file.ext - should response with file stream`, async () => {
        const params = TestUtil.defaulHandleParams()
        const filename = '/file.ext'
        params.resquest.method = 'GET'
        params.resquest.url = filename
        const expectType = '.ext'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectType
        })

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        await handler(...params.values())
        expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).not.toHaveBeenCalled()
    })

    test(`POST /unknown - given an inexistent route it should reponse with 404`, async () => {
        const params = TestUtil.defaulHandleParams()
        params.resquest.method = 'POST'
        params.resquest.url = '/unknown'

        await handler(...params.values())

        expect(params.response.writeHead).toHaveBeenCalledWith(404)
        expect(params.response.end).toHaveBeenCalled()

    })


    describe('exceptions', () => {
        test('given inexistent file it should respond with 404', async () => {
            const params = TestUtil.defaulHandleParams()
            params.resquest.method = 'GET'
            params.resquest.url = '/index.png'


            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name,
            ).mockRejectedValue(new Error('Error: ENOENT: no such file or directy'))

            await handler(...params.values())
            
            expect(params.response.writeHead).toHaveBeenCalledWith(404)
            expect(params.response.end).toHaveBeenCalled()

        })
        test('given an error it should respond with 500', async () => {
            const params = TestUtil.defaulHandleParams()
            params.resquest.method = 'GET'
            params.resquest.url = '/index.png'



            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name,
            ).mockRejectedValue(new Error('Error:'))

            await handler(...params.values())

            expect(params.response.writeHead).toHaveBeenCalledWith(500)
            expect(params.response.end).toHaveBeenCalled()

        })
    })
})