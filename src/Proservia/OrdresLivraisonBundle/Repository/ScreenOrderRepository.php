<?php
namespace Proservia\OrdresLivraisonBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class ScreenOrderRepository
 * @package Proservia\OrdresLivraisonBundle\Repository
 */
class ScreenOrderRepository extends EntityRepository
{
    /**
     * @return array
     */
    public function findAll()
    {
        return $this->findBy(array(), array('date' => 'DESC', 'numOfTheDay' => 'DESC'));
    }
}