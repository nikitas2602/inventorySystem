from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, SessionLocal, engine, get_db
from .seed import seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


app = FastAPI(title="Shelfwise Inventory API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_or_404(db: Session, product_id: int) -> models.Product:
    product = db.get(models.Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


def ensure_unique_sku(db: Session, sku: str, ignore_id: int | None = None):
    existing = db.query(models.Product).filter(models.Product.sku == sku).first()
    if existing and existing.id != ignore_id:
        raise HTTPException(409, f"SKU {sku} is already used by another product")


@app.get("/products", response_model=list[schemas.ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.name).all()


@app.post("/products", response_model=schemas.ProductOut, status_code=201)
def create_product(data: schemas.ProductCreate, db: Session = Depends(get_db)):
    ensure_unique_sku(db, data.sku)
    product = models.Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@app.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, data: schemas.ProductCreate, db: Session = Depends(get_db)):
    product = get_or_404(db, product_id)
    ensure_unique_sku(db, data.sku, ignore_id=product_id)
    for field, value in data.model_dump().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@app.patch("/products/{product_id}/stock", response_model=schemas.ProductOut)
def adjust_stock(product_id: int, body: schemas.StockAdjust, db: Session = Depends(get_db)):
    product = get_or_404(db, product_id)
    product.quantity = max(0, product.quantity + body.delta)
    db.commit()
    db.refresh(product)
    return product


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db.delete(get_or_404(db, product_id))
    db.commit()
    return Response(status_code=204)


@app.get("/stats", response_model=schemas.Stats)
def get_stats(db: Session = Depends(get_db)):
    P = models.Product
    total_products, total_units, value = db.query(
        func.count(P.id),
        func.coalesce(func.sum(P.quantity), 0),
        func.coalesce(func.sum(P.quantity * P.price), 0.0),
    ).one()
    out = db.query(func.count(P.id)).filter(P.quantity == 0).scalar()
    low = db.query(func.count(P.id)).filter(P.quantity > 0, P.quantity <= P.reorder_level).scalar()
    return schemas.Stats(
        total_products=total_products,
        total_units=total_units,
        inventory_value=value,
        low_stock=low,
        out_of_stock=out,
    )
