import io

from openpyxl import Workbook

from app.tabular import parse_csv, parse_tabular, parse_xlsx


def test_parse_csv_rows():
    data = b"name,role\nAda,engineer\nGrace,admiral\n"
    rows = parse_csv(data)
    assert len(rows) == 2
    assert "name: Ada" in rows[0]
    assert "role: engineer" in rows[0]


def test_parse_csv_skips_empty_cells():
    data = b"a,b,c\n1,,3\n"
    rows = parse_csv(data)
    assert rows == ["a: 1 | c: 3"]


def test_parse_xlsx_rows():
    wb = Workbook()
    ws = wb.active
    ws.title = "Sheet1"
    ws.append(["product", "price"])
    ws.append(["Widget", 9.99])
    buf = io.BytesIO()
    wb.save(buf)
    rows = parse_xlsx(buf.getvalue())
    assert len(rows) == 1
    assert "[Sheet1]" in rows[0]
    assert "product: Widget" in rows[0]
    assert "price: 9.99" in rows[0]


def test_parse_tabular_dispatch_and_error():
    assert parse_tabular("data.csv", b"x\n1\n") == ["x: 1"]
    try:
        parse_tabular("data.txt", b"nope")
        assert False, "expected ValueError"
    except ValueError:
        pass
