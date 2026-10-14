import importlib.util,json,sys,uuid
from pathlib import Path
from types import SimpleNamespace
root=Path(__file__).resolve().parents[5]
spec=importlib.util.spec_from_file_location("seed",root/"backend/tools/tourism_seed.py")
seed=importlib.util.module_from_spec(spec);spec.loader.exec_module(seed)
args=SimpleNamespace(container="soomgil-postgres-1",database="soomgil",user="soomgil")
database="soomgil_seed_qa_"+uuid.uuid4().hex[:8]
seed.psql(args,"CREATE DATABASE "+database)
args.database=database
try:
    for migration in ["V24__create_tourism_source_place_tables.sql","V52__persist_kto_responses.sql","V53__track_kto_manual_refresh.sql"]:
        seed.psql(args,(root/"backend/src/main/resources/db/migration"/migration).read_text(encoding="utf-8"))
    place={"content_id":100,"title":"최신 관광지","overview":"유지할 설명","source_modified_at":"2026-09-17T00:00:00Z","imported_at":"2026-09-17T00:00:00Z"}
    photo={"content_id":100,"source_provider":"KTO","source_type":"TOUR_API","public_url":"https://example.org/photo.jpg","updated_at":"2026-09-17T00:00:00Z"}
    data={"version":1,"tables":{"contenttypes":[],"attractions":[place,place],"attraction_images":[photo,photo],"kto_responses":[]}}
    for _ in range(2): seed.psql(args,seed.import_sql(data))
    assert seed.psql(args,"SELECT count(*) FROM tourism_source.attractions") == "1"
    assert seed.psql(args,"SELECT count(*) FROM tourism_source.attraction_images") == "1"
    data["tables"]["attractions"]=[{**place,"title":"오래된 관광지","source_modified_at":"2025-01-01T00:00:00Z"}]
    seed.psql(args,seed.import_sql(data))
    assert seed.psql(args,"SELECT title FROM tourism_source.attractions") == "최신 관광지"
    args.file=Path(__file__).with_name("seed-roundtrip.json")
    seed.export_seed(args)
    exported=json.loads(args.file.read_text(encoding="utf-8"))
    seed.psql(args,seed.import_sql(exported))
    assert seed.psql(args,"SELECT count(*) FROM tourism_source.attraction_images") == "1"
    print("실제 PostgreSQL: 중복/재적용/오래된 seed/내보내기 재가져오기 검증 통과")
finally:
    args.database="soomgil"
    seed.psql(args,"DROP DATABASE "+database)
