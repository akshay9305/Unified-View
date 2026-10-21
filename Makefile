# Change to the 'scripts' directory where all the scripts are located

# Target to pull the latest changes from the uniview repository
uniview-repo-pull:
	@echo "Pulling the latest changes from the uniview repository..."
	@cd ./scripts/ && sh git_pull.sh

# Target to install dependencies for the uniview application
uniview-install:
	@echo "Running installation scripts..."
	@cd ./scripts/ && sh installations.sh

# Target to install backend dependencies for the uniview application
uniview-deploy-backend:
	@echo "Installing backend dependencies..."
	@cd ./scripts/ && sh backend_deployment.sh

# Target to install frontend dependencies for the uniview application
uniview-deploy-frontend:
	@echo "Installing frontend dependencies..."
	@cd ./scripts/ && sh frontend_deployment.sh

# Target to redeploy the backend for the uniview application
uniview-redeploy-backend:
	@echo "Redeploying backend..."
	@cd ./scripts/ && sh backend_redeployment.sh

# Target to redeploy the frontend for the uniview application
uniview-redeploy-frontend:
	@echo "Redeploying frontend..."
	@cd ./scripts/ && sh frontend_redeployment.sh

# Target to start the uniview application
uniview-app-start:
	@echo "Starting the uniview application..."
	@cd ./scripts/ && sh fastapi.sh start

# Target to stop the uniview application
uniview-app-stop:
	@echo "Stopping the uniview application..."
	@cd ./scripts/ && sh fastapi.sh stop