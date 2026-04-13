import React, { createContext, useState, useContext, useEffect } from "react";

const ProductFieldsContext = createContext();

export const useProductFields = () => {
  const context = useContext(ProductFieldsContext);
  if (!context) {
    throw new Error(
      "useProductFields must be used within ProductFieldsProvider",
    );
  }
  return context;
};

export const ProductFieldsProvider = ({ children }) => {
  const [fields, setFields] = useState(() => {
    const saved = localStorage.getItem("productFields");
    if (saved) return JSON.parse(saved);

    // Поля по умолчанию
    return [
      {
        id: "name",
        label: "Название",
        type: "text",
        required: true,
        visible: true,
      },
      {
        id: "price",
        label: "Цена",
        type: "number",
        required: true,
        visible: true,
      },
      {
        id: "sku",
        label: "Артикул",
        type: "text",
        required: false,
        visible: true,
      },
    ];
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    if (saved) return JSON.parse(saved);
    return [];
  });

  useEffect(() => {
    localStorage.setItem("productFields", JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const addField = (field) => {
    setFields([...fields, { ...field, id: Date.now().toString() }]);
  };

  const updateField = (id, updatedField) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updatedField } : f)));
  };

  const deleteField = (id) => {
    if (fields.length <= 1) {
      alert("Должно быть хотя бы одно поле");
      return;
    }
    setFields(fields.filter((f) => f.id !== id));
    // Удаляем это поле из всех товаров
    const updatedProducts = products.map((product) => {
      const newProduct = { ...product };
      delete newProduct[id];
      return newProduct;
    });
    setProducts(updatedProducts);
  };

  const reorderFields = (startIndex, endIndex) => {
    const result = Array.from(fields);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setFields(result);
  };

  const addProduct = (product) => {
    setProducts([...products, { ...product, id: Date.now() }]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, ...updatedProduct } : p)),
    );
  };

  const deleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <ProductFieldsContext.Provider
      value={{
        fields,
        products,
        addField,
        updateField,
        deleteField,
        reorderFields,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductFieldsContext.Provider>
  );
};
