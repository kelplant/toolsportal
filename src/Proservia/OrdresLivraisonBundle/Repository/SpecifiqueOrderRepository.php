<?php
namespace Proservia\OrdresLivraisonBundle\Repository;

use Doctrine\ORM\EntityRepository;

/**
 * Class SpecifiqueOrderRepository
 * @package Proservia\OrdresLivraisonBundle\Repository
 */
class SpecifiqueOrderRepository extends EntityRepository
{
    /**
     * @return array
     */
    public function findAll()
    {
        return $this->findBy(array(), array('date' => 'DESC'));
    }
}