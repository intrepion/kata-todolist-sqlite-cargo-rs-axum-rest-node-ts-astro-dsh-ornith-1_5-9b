use axum::Router;

mod app;
mod error;
mod model;
mod schema;

#[tokio::main]
async fn main() -> Result<(), error::Error> {
    let port = std::env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://:memory:?mode=rwc".to_string());

    let app = app::build(schema::init(&database_url).await?);

    println!("listening on http://localhost:{port}/ (DATABASE_URL={database_url})");
    let listener = tokio::net::TcpListener::bind(&format!("0.0.0.0:{port}")).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
