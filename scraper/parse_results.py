from bs4 import BeautifulSoup


def parse_student_results(html):
    soup = BeautifulSoup(html, "html.parser")
    name_tag = soup.find("h5", string=lambda x: x and "Name" in x)
    index_tag = soup.find("h5", string=lambda x: x and "Index" in x)

    if not name_tag or not index_tag:
        raise Exception("Name or Index not found on the page.")

    name = name_tag.text.split(":")[1].strip()
    index_no = index_tag.text.split(":")[1].strip()

    tables = soup.find_all("table")
    print('tables ',tables)
    data = []

    for table in tables:
        rows = table.find_all("tr")[1:]  # skip header
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 5:
                continue
            subject = cols[0].get_text(strip=True)
            year = cols[1].get_text(strip=True).strip("[]")
            sem = cols[2].get_text(strip=True).strip("[]")
            credits = cols[3].get_text(strip=True)
            result = cols[4].get_text(strip=True)
            data.append([subject, year, sem, credits, result])

    return name, index_no, data
