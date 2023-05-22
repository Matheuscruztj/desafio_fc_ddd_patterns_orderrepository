import { Sequelize } from "sequelize-typescript";
import ProductRepository from "./product.repository";
import ProductModel from "../db/sequelize/model/product.model";
import Product from "../../domain/entity/product";

describe("Product repository test", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true },
        });

        sequelize.addModels([ProductModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should create a product", async () => {
        const productRepository = new ProductRepository();
        const product = new Product("1", "Product 1", 100);
        
        await productRepository.create(product);

        const productModel = await ProductModel.findOne({
            where: {
                id: "1" 
            }
        });

        expect(productModel.toJSON()).toStrictEqual({
            id: "1",
            name: "Product 1",
            price: 100,
        });
    });

    it("should update a product", async () => {
        const productRepository = new ProductRepository();
        const product = new Product("1", "Product 1", 100);

        await productRepository.create(product);

        product.changeName("Product 2");
        await productRepository.update(product);

        const productModel = await ProductModel.findOne({ where: { id: "1" } });

        expect(productModel.toJSON()).toStrictEqual({
            id: "1",
            name: product.name,
            price: product.price,
        });
    });

    it("should find a product", async () => {
        const productRepository = new ProductRepository();
        const product = new Product("123", "Product 1", 1);
        await productRepository.create(product);
    
        const productResult = await productRepository.find(product.id);
    
        expect(product).toStrictEqual(productResult);
    });

    it("should throw an error when product is not found", async () => {
        const productRepository = new ProductRepository();
    
        expect(async () => {
          await productRepository.find("1234");
        }).rejects.toThrow("Product not found");
    });

    it("should find all products", async () => {
        const productRepository = new ProductRepository();

        const product1 = new Product("123", "Product 1", 1);
        const product2 = new Product("456", "product 2", 2);
    
        await productRepository.create(product1);
        await productRepository.create(product2);
    
        const products = await productRepository.findAll();
    
        expect(products).toHaveLength(2);
        expect(products).toContainEqual(product1);
        expect(products).toContainEqual(product2);
      });
});