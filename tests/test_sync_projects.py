import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('sync', Path(__file__).resolve().parents[1] / 'scripts/sync_projects.py')
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)

REPO = {'owner': {'login': 'starrybodies'}, 'name': 'sample', 'full_name': 'starrybodies/sample', 'private': False, 'fork': False, 'archived': False, 'homepage': 'https://sample.example.com', 'topics': [], 'html_url': 'https://github.com/starrybodies/sample'}


class PublishingCriteria(unittest.TestCase):
    def test_private_fork_archived_hidden_and_other_owner_excluded(self):
        for field in ('private', 'fork', 'archived'):
            repo = {**REPO, field: True}
            self.assertFalse(sync.eligible(repo))
        self.assertFalse(sync.eligible({**REPO, 'topics': ['portfolio-hidden']}))
        self.assertFalse(sync.eligible({**REPO, 'owner': {'login': 'someone-else'}}))
        self.assertFalse(sync.eligible({**REPO, 'name': 'samu.quest'}))

    def test_preview_never_qualifies_even_with_production_flag(self):
        self.assertFalse(sync.production({'environment': 'Preview', 'production_environment': True}))
        self.assertTrue(sync.production({'environment': 'Production', 'production_environment': False}))

    def test_latest_failed_deployment_does_not_use_old_success(self):
        def fetch(path, paginate=False):
            if '/statuses' in path:
                return [{'state': 'failure'}]
            return [{'id': 2, 'environment': 'Production'}, {'id': 1, 'environment': 'Production'}]
        self.assertIsNone(sync.deployment_evidence(REPO, fetch))

    def test_success_and_personal_category(self):
        def fetch(path, paginate=False):
            if path.startswith('users/'):
                return [{**REPO, 'topics': ['portfolio-personal']}]
            if '/statuses' in path:
                return [{'state': 'success', 'created_at': '2026-10-03T00:00:00Z'}]
            return [{'id': 1, 'environment': 'Production'}]
        records = sync.collect(fetch, lambda url: True)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]['category'], 'personal')
        self.assertEqual(sync.collect(fetch, lambda url: False), [])

    def test_no_deployment_requires_explicit_live_topic(self):
        self.assertIsNone(sync.deployment_evidence(REPO, lambda *args, **kwargs: []))
        repo = {**REPO, 'topics': ['portfolio-live'], 'created_at': '2026-10-03T00:00:00Z'}
        self.assertIsNotNone(sync.deployment_evidence(repo, lambda *args, **kwargs: []))

    def test_source_errors_abort_before_publishing(self):
        def fetch(*args, **kwargs):
            raise RuntimeError('Source unavailable')
        with self.assertRaises(RuntimeError):
            sync.collect(fetch)

    def test_urls(self):
        for value in ('javascript:alert(1)', 'http://example.com', 'https://localhost', 'https://127.0.0.1', 'https://user:pass@example.com', 'https://example.com:8080', None):
            self.assertFalse(sync.public_url(value))
        self.assertTrue(sync.public_url('https://overshoot.gaiaai.xyz'))


if __name__ == '__main__':
    unittest.main()
