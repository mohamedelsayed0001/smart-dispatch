package com.smartdispatch.util;

public class LocationCoordinates {
  private final Double latitude;
  private final Double longitude;

  public LocationCoordinates(Double latitude, Double longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }

  public Double getLatitude() {
    return latitude;
  }

  public Double getLongitude() {
    return longitude;
  }
}
