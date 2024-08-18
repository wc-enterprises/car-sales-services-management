Commands to deploy to different environments.

## Use the following commands to deploy code to grace-auto-service:

1. ng build --configuration=graceAutoService
2. firebase deploy --project graceAutoService --only hosting

## To deploy to car-sales-and-service-management, run the following commands:

1. ng build --configuration=carSalesAndServiceManagement
2. firebase deploy --project carSalesAndServiceManagement --only hosting

## to deploy to default environment

1. ng build
2. firebase deploy --default carSalesAndServiceManagement --only hosting
