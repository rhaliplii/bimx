PYTHON ?= python3
PORT   ?= 8000

.PHONY: all build validate links check serve mirror clean

all: check

validate:          ## verifică lecțiile din src/academy/content/
	$(PYTHON) tools/validate.py

build:             ## generează dist/ din src/
	$(PYTHON) tools/build.py

links: build       ## verifică linkurile locale din dist/
	$(PYTHON) tools/check_links.py

check: validate links

serve: build       ## pornește un server local pe http://localhost:$(PORT)/
	$(PYTHON) -m http.server $(PORT) --directory dist

mirror:            ## reîmprospătează src/bimx-mirror/ de pe bimx.md (rețea)
	$(PYTHON) tools/mirror_bimx.py

clean:
	rm -rf dist tools/sitegen/__pycache__ tools/__pycache__
