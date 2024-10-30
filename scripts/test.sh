set -e

node scripts/load-env .env.test
npm run inbucket:start &
docker run --add-host=host.docker.internal:host-gateway --rm -it -d stripe/stripe-cli:latest listen --forward-to http://host.docker.internal:3000/api/stripe/webhook --skip-verify --api-key "$STRIPE_SECRET_KEY" --log-level debug

if [ "$1" = "build" ]; then
  echo "Building and testing in production mode"
  NODE_ENV=test next build
  NODE_ENV=test next start &
else
  echo "Testing in development mode"
  npm run dev:test &
fi

npm run cypress:headless
exit 0