from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
import models
import schemas
from auth import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_admin_stats(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    total_users = db.query(func.count(models.User.id)).scalar()
    total_listings = db.query(func.count(models.Listing.id)).scalar()
    active_listings = db.query(func.count(models.Listing.id)).filter(
        models.Listing.status == models.ListingStatus.ACTIVE
    ).scalar()
    sold_listings = db.query(func.count(models.Listing.id)).filter(
        models.Listing.status == models.ListingStatus.SOLD
    ).scalar()
    total_requests = db.query(func.count(models.BuyRequest.id)).scalar()
    pending_requests = db.query(func.count(models.BuyRequest.id)).filter(
        models.BuyRequest.status == models.RequestStatus.PENDING
    ).scalar()
    accepted_requests = db.query(func.count(models.BuyRequest.id)).filter(
        models.BuyRequest.status == models.RequestStatus.ACCEPTED
    ).scalar()
    completed_requests = db.query(func.count(models.BuyRequest.id)).filter(
        models.BuyRequest.status == models.RequestStatus.COMPLETED
    ).scalar()
    
    return {
        "users": {
            "total": total_users
        },
        "listings": {
            "total": total_listings,
            "active": active_listings,
            "sold": sold_listings
        },
        "requests": {
            "total": total_requests,
            "pending": pending_requests,
            "accepted": accepted_requests,
            "completed": completed_requests
        }
    }

@router.get("/listings", response_model=List[schemas.ListingResponse])
def get_all_listings(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    listings = db.query(models.Listing).all()
    return listings

@router.get("/requests", response_model=List[schemas.BuyRequestResponse])
def get_all_requests(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    requests = db.query(models.BuyRequest).all()
    return requests

@router.get("/users", response_model=List[schemas.UserResponse])
def get_all_users(
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    return users

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    # Cascade delete is handled by relationships if configured, but let's be safe
    db.query(models.Listing).filter(models.Listing.seller_id == user_id).delete()
    db.delete(user)
    db.commit()
    return None

@router.delete("/listings/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing_admin(
    listing_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    listing = db.query(models.Listing).filter(models.Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    
    db.delete(listing)
    db.commit()
    return None

@router.post("/users/{user_id}/pay-commission")
def mark_commission_paid(
    user_id: int,
    current_user: models.User = Depends(require_role([models.UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user.has_unpaid_commission = False
    user.commission_due = 0.0
    db.commit()
    return {"status": "success", "message": "Commission marked as paid"}
