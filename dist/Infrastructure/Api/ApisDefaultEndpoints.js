"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultApiEndpoints = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_output_json_1 = __importDefault(require("../../swagger-output.json"));
class DefaultApiEndpoints {
    static start(app) {
        app.use("/doc", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default));
        app.get("/", (req, res) => {
            /**
              #swagger.tags = ['Outros']
              #swagger.ignore = true
            */
            res.status(200).send(`<h1>Challenge 5 SOAT8 v1.0 - Serviço de Status e Reprocessamento</h1><br>`);
        });
    }
}
exports.DefaultApiEndpoints = DefaultApiEndpoints;
