"""Ensure the production browser-upload CORS rule without removing other rules.

Run with --apply after configuring AWS credentials that can read and update the
target bucket's CORS configuration. Without --apply this performs a read-only check.
"""

import argparse
import json
from pathlib import Path


RULE_ID = "soomgil-browser-media-upload"
RULE_FILE = Path(__file__).with_name("s3-cors.json")


def merge_rules(existing: list[dict], required: dict) -> list[dict]:
    """Put our rule first, retaining every unrelated bucket CORS rule."""
    return [required, *[rule for rule in existing if rule.get("ID") != required["ID"]]]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bucket", required=True, help="Production media bucket name")
    parser.add_argument("--region", default="ap-northeast-2")
    parser.add_argument("--apply", action="store_true", help="Write the required CORS rule")
    args = parser.parse_args()

    import boto3
    from botocore.exceptions import ClientError

    required = next(
        rule for rule in json.loads(RULE_FILE.read_text(encoding="utf-8"))["CORSRules"]
        if rule["ID"] == RULE_ID
    )
    s3 = boto3.client("s3", region_name=args.region)
    try:
        existing = s3.get_bucket_cors(Bucket=args.bucket)["CORSRules"]
    except ClientError as error:
        if error.response["Error"]["Code"] != "NoSuchCORSConfiguration":
            raise
        existing = []

    merged = merge_rules(existing, required)
    if existing == merged:
        print(f"CORS rule {RULE_ID} is already configured on {args.bucket}.")
        return 0

    if not args.apply:
        print(f"CORS rule {RULE_ID} is missing or outdated on {args.bucket}; run with --apply.")
        return 1

    s3.put_bucket_cors(Bucket=args.bucket, CORSConfiguration={"CORSRules": merged})
    applied = s3.get_bucket_cors(Bucket=args.bucket)["CORSRules"]
    if applied != merged:
        print("CORS update was submitted but could not be verified.")
        return 1
    preserved = len(merged) - 1
    print(f"CORS rule {RULE_ID} is configured on {args.bucket}; {preserved} unrelated rule(s) preserved.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
