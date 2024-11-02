export function moveObject(object, facingAngle, moveSpeed, delta) {
    if (delta > 100) {
        return;
    }

    const velocityX = Math.cos(facingAngle) * moveSpeed;
    const velocityY = Math.sin(facingAngle) * moveSpeed;

    object.x += velocityX / 50;
    object.y += velocityY / 50;
}
