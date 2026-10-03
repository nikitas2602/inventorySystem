from .models import Product

SAMPLE = [
    ("Wireless Mouse", "EL-1001", "Electronics", 799, 42, 15),
    ("USB-C Hub 7-in-1", "EL-1002", "Electronics", 2499, 8, 10),
    ("Mechanical Keyboard", "EL-1003", "Electronics", 4999, 0, 5),
    ('27" Monitor', "EL-1004", "Electronics", 15999, 6, 4),
    ("A4 Copier Paper (500 sheets)", "ST-2001", "Stationery", 349, 120, 40),
    ("Gel Pens (box of 10)", "ST-2002", "Stationery", 180, 18, 25),
    ("Sticky Notes Pack", "ST-2003", "Stationery", 95, 64, 30),
    ("Ergonomic Chair", "FU-3001", "Furniture", 8999, 9, 3),
    ("Standing Desk", "FU-3002", "Furniture", 18499, 3, 3),
    ("Bubble Wrap Roll", "PK-4001", "Packaging", 650, 2, 10),
    ("Shipping Boxes (Medium)", "PK-4002", "Packaging", 42, 300, 100),
]


def seed_if_empty(db):
    if db.query(Product).count() == 0:
        db.add_all(
            Product(name=n, sku=s, category=c, price=p, quantity=q, reorder_level=r)
            for n, s, c, p, q, r in SAMPLE
        )
        db.commit()
