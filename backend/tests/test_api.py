import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_plants_and_dashboard():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # List plants
        plants_res = await ac.get(f"{settings.API_V1_PREFIX}/plants")
        assert plants_res.status_code == 200
        plants = plants_res.json()
        assert len(plants) >= 1
        plant_id = plants[0]["id"]
        assert plants[0]["name"] == "Austin Gigafactory - Plant 04"
        assert len(plants[0]["departments"]) >= 3

        # Dashboard stats
        dash_res = await ac.get(f"{settings.API_V1_PREFIX}/plants/{plant_id}/dashboard")
        assert dash_res.status_code == 200
        dash = dash_res.json()
        assert dash["total_activities"] >= 4
        assert "monthly_audit_score" in dash
        assert len(dash["zones"]) >= 3
        assert len(dash["completion_trend"]) >= 4

@pytest.mark.asyncio
async def test_activity_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        plants_res = await ac.get(f"{settings.API_V1_PREFIX}/plants")
        plant = plants_res.json()[0]
        zone = plant["departments"][0]["zones"][0]

        # 1. Create Activity
        new_act_payload = {
            "plant_id": plant["id"],
            "zone_id": zone["id"],
            "category": "shine_seiso",
            "title": "Clean and Degrease Lathe 04 Spindle",
            "problem_description": "Metal chips and oil deposits on spindle head.",
            "priority": "high",
            "initial_before_photo_url": "https://example.com/before.jpg"
        }
        create_res = await ac.post(f"{settings.API_V1_PREFIX}/activities", json=new_act_payload)
        assert create_res.status_code == 200
        act = create_res.json()
        assert act["status"] == "draft"
        assert act["activity_number"].startswith("5S-")
        act_id = act["id"]

        # 2. Upload After Photo Evidence
        ev_payload = {
            "media_type": "after_photo",
            "file_name": "lathe_spindle_clean.jpg",
            "file_url": "https://example.com/after.jpg",
            "file_size_bytes": 1024 * 350
        }
        ev_res = await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/evidence", json=ev_payload)
        assert ev_res.status_code == 200

        # 3. Submit for Review
        sub_payload = {
            "actor_name": "Alex Chen (Operator)",
            "submission_note": "Spindle cleared and polished with solvent.",
            "benefits_safety": True,
            "benefits_space_sqft": 4.0,
            "benefits_time_seconds": 30.0,
            "benefits_cost_savings": 500.0,
            "benefits_summary": "Prevented spindle bearing premature wear."
        }
        sub_res = await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/submit", json=sub_payload)
        assert sub_res.status_code == 200
        submitted_act = sub_res.json()
        assert submitted_act["status"] == "submitted_for_review"

        # 4. Rejection with mandatory reason test
        rej_missing_payload = {
            "decision": "reject",
            "reviewer_name": "Dave Vance (Supervisor)"
        }
        fail_res = await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/review", json=rej_missing_payload)
        assert fail_res.status_code == 400

        rej_payload = {
            "decision": "reject",
            "reviewer_name": "Dave Vance (Supervisor)",
            "rejection_reason": "Wipe down the safety shield glass before sign-off."
        }
        rej_res = await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/review", json=rej_payload)
        assert rej_res.status_code == 200
        rejected_act = rej_res.json()
        assert rejected_act["status"] == "rejected"
        assert rejected_act["rejection_reason"] == "Wipe down the safety shield glass before sign-off."

        # 5. Resubmit and Approve
        await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/submit", json={"actor_name": "Alex Chen", "submission_note": "Shield glass wiped clean."})
        app_payload = {
            "decision": "approve",
            "reviewer_name": "Dave Vance (Supervisor)",
            "review_notes": "Exemplary work."
        }
        app_res = await ac.post(f"{settings.API_V1_PREFIX}/activities/{act_id}/review", json=app_payload)
        assert app_res.status_code == 200
        approved_act = app_res.json()
        assert approved_act["status"] == "completed"

        # 6. Test PDF generation
        pdf_res = await ac.get(f"{settings.API_V1_PREFIX}/reports/activity/{act_id}/pdf")
        assert pdf_res.status_code == 200
        assert pdf_res.headers["content-type"] == "application/pdf"
        assert len(pdf_res.content) > 1000  # Valid non-empty PDF bytes!
