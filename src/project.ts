import {
  feature,
  field,
  mandatory,
  project,
  table,
  trigger,
  unique,
  useTable,
  workflow,
} from '@january/declarative';

import {
  createQueryBuilder,
  deferredJoinPagination,
  execute,
  saveEntity,
  setEntity,
} from '@extensions/postgresql';
import { tables } from '@workspace/entities';

export default project(
  feature('menu', {
    workflows: [
      workflow('ListMenusWorkflow', {
        tag: 'menus',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        execute: async ({ trigger }) => {
          const qb = createQueryBuilder(tables.menus, 'menus');
          const paginationMetadata = deferredJoinPagination(qb, {
            pageSize: trigger.query.pageSize,
            pageNo: trigger.query.pageNo,
            count: await qb.getCount(),
          });
          const records = await execute(qb);
          return { menus: records, meta: paginationMetadata(records) };
        },
      }),
      workflow('CreateMenuWorkflow', {
        tag: 'menus',
        trigger: trigger.http({
          method: 'post',
          path: '/',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.menus, {
            name: trigger.body.name,
          });
        },
      }),
      workflow('CreateProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.products, {
            name: trigger.body.name,
            price: trigger.body.priceId,
            discount: trigger.body.discount,
            calories: trigger.body.calories,
            description: trigger.body.description,
            image: trigger.body.image,
            category: trigger.body.categoryId,
          });
        },
      }),
      workflow('ListProductsWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/',
        }),
        execute: async ({ trigger }) => {
          const qb = createQueryBuilder(tables.products, 'products');
          const paginationMetadata = deferredJoinPagination(qb, {
            pageSize: trigger.query.pageSize,
            pageNo: trigger.query.pageNo,
            count: await qb.getCount(),
          });
          const records = await execute(qb);
          return { products: records, meta: paginationMetadata(records) };
        },
      }),
      workflow('CreateCategoryWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/category',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.categories, {
            name: trigger.body.name,
            menu: trigger.body.menuId,
          });
        },
      }),
      workflow('ListCategoriesWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/category',
        }),
        execute: async ({ trigger }) => {
          const qb = createQueryBuilder(tables.categories, 'categories');
          const paginationMetadata = deferredJoinPagination(qb, {
            pageSize: trigger.query.pageSize,
            pageNo: trigger.query.pageNo,
            count: await qb.getCount(),
          });
          const records = await execute(qb);
          return { categories: records, meta: paginationMetadata(records) };
        },
      }),
      workflow('CreateProductTagWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/tag',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.productTags, {
            name: trigger.body.name,
          });
        },
      }),
      workflow('ListProductTagsWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'get',
          path: '/tag',
        }),
        execute: async ({ trigger }) => {
          const qb = createQueryBuilder(tables.productTags, 'productTags');
          const paginationMetadata = deferredJoinPagination(qb, {
            pageSize: trigger.query.pageSize,
            pageNo: trigger.query.pageNo,
            count: await qb.getCount(),
          });
          const records = await execute(qb);
          return { tags: records, meta: paginationMetadata(records) };
        },
      }),
      workflow('CreateProductOptionWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'post',
          path: '/option',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.productOptions, {
            name: trigger.body.name,
            price: trigger.body.priceId,
          });
        },
      }),
      workflow('UpdateProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:id',
        }),
        execute: async ({ trigger }) => {
          const qb = createQueryBuilder(tables.products, 'products').where(
            'id = :id',
            { id: trigger.path.id },
          );
          await setEntity(qb, {
            name: trigger.body.name,
            price: trigger.body.priceId,
            discount: trigger.body.discount,
            calories: trigger.body.calories,
            description: trigger.body.description,
            image: trigger.body.image,
            category: trigger.body.category,
          });
        },
      }),
      workflow('AssignTagToProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:productId/tag',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.productTagLink, {
            productId: trigger.path.productId,
            tag: trigger.body.tagId,
          });
        },
      }),
      workflow('AssignOptionToProductWorkflow', {
        tag: 'products',
        trigger: trigger.http({
          method: 'patch',
          path: '/product/:productId/option',
        }),
        execute: async ({ trigger }) => {
          await saveEntity(tables.productOptionLink, {
            productId: trigger.path.productId,
            option: trigger.body.optionId,
          });
        },
      }),
      workflow('CreateOrderWorkflow', {
        tag: 'orders',
        trigger: trigger.http({
          method: 'post',
          path: '/order',
        }),
        execute: async ({ trigger }) => {
          const order = await saveEntity(tables.order, {});
          await saveEntity(tables.orderDetails, {
            total: trigger.body.total,
            subtotal: trigger.body.subtotal,
            tax: trigger.body.tax,
            orderId: order.id,
          });
        },
      }),
    ],
    tables: {
      offers: table({
        fields: {
          title: field({
            type: 'short-text',
            validations: [mandatory()],
          }),
          subtitle: field({ type: 'short-text' }),
          image: field({ type: 'url' }),
        },
      }),
      menus: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
        },
      }),
      categories: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          menu: field.relation({
            references: useTable('menus'),
            relationship: 'many-to-one',
          }),
        },
      }),
      products: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          discount: field.integer(),
          calories: field.integer(),
          description: field({ type: 'long-text' }),
          image: field({ type: 'url' }),
          category: field.relation({
            references: useTable('categories'),
            relationship: 'many-to-one',
          }),
        },
      }),
      pricing: table({
        fields: {
          price: field({ type: 'price' }),
        },
      }),
      productTags: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
        },
      }),
      productOptions: table({
        fields: {
          name: field({
            type: 'short-text',
            validations: [unique(), mandatory()],
          }),
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
        },
      }),
      productTagLink: table({
        fields: {
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          tag: field.relation({
            references: useTable('productTags'),
            relationship: 'many-to-one',
          }),
        },
      }),
      productOptionLink: table({
        fields: {
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          option: field.relation({
            references: useTable('productOptions'),
            relationship: 'many-to-one',
          }),
        },
      }),
    },
  }),
  feature('orders', {
    workflows: [],
    tables: {
      order: table({
        fields: {},
      }),
      orderItemOption: table({
        fields: {
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          option: field.relation({
            references: useTable('productOptions'),
            relationship: 'many-to-one',
          }),
        },
      }),
      orderItem: table({
        fields: {
          price: field.relation({
            references: useTable('pricing'),
            relationship: 'many-to-one',
          }),
          product: field.relation({
            references: useTable('products'),
            relationship: 'many-to-one',
          }),
          quantity: field.integer(),
        },
      }),
      orderItemToOrderOptionLink: table({
        fields: {
          item: field.relation({
            references: useTable('orderItem'),
            relationship: 'many-to-one',
          }),
          option: field.relation({
            references: useTable('productOptions'),
            relationship: 'many-to-one',
          }),
        },
      }),
      orderDetails: table({
        fields: {
          total: field({ type: 'price' }),
          subtotal: field({ type: 'price' }),
          tax: field({ type: 'percentage' }),
          order: field.relation({
            references: useTable('order'),
            relationship: 'one-to-one',
          }),
        },
      }),
      orderToOrderItemLink: table({
        fields: {
          order: field.relation({
            references: useTable('order'),
            relationship: 'many-to-one',
          }),
          item: field.relation({
            references: useTable('orderItem'),
            relationship: 'many-to-one',
          }),
        },
      }),
    },
  }),
);
