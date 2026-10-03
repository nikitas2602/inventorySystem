from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    sku: str = Field(min_length=1, max_length=40)
    category: str = Field(min_length=1, max_length=60)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    reorder_level: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class StockAdjust(BaseModel):
    delta: int


class Stats(BaseModel):
    total_products: int
    total_units: int
    inventory_value: float
    low_stock: int
    out_of_stock: int
